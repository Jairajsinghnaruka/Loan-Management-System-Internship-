const db = require('../config/db');
const paymentRepo = require('../repositories/paymentrepo');

function generateNBFC247Schedule(principal, annualRate, tenureMonths, startDate) {
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  let balance = principal;
  const schedule = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interestComponent = balance * monthlyRate;
    const principalComponent = emi - interestComponent;
    balance -= principalComponent;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installment_no: i,
      due_date: dueDate.toISOString().slice(0, 10),
      amount: Number(emi.toFixed(2)),
      principal_component: Number(principalComponent.toFixed(2)),
      interest_component: Number(interestComponent.toFixed(2)),
      penalty_component: 0,
      opening_balance: Number((balance + principalComponent).toFixed(2)),
      closing_balance: Number(Math.max(0, balance).toFixed(2))
    });
  }
  return schedule;
}

exports.createLoanWithSchedule = async (data) => {
  const { principal_amount, interest_rate, tenure_months, start_date } = data;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [loanRes] = await conn.execute(
      `INSERT INTO loans (principal_amount, balance, interest_rate, tenure_months, status, created_at) VALUES (?, ?, ?, ?, 'ACTIVE', NOW())`,
      [principal_amount, principal_amount, interest_rate, tenure_months]
    );
    const loanId = loanRes.insertId;
    const schedule = generateNBFC247Schedule(Number(principal_amount), Number(interest_rate), Number(tenure_months), start_date || new Date());

    for (const row of schedule) {
      await conn.execute(
        `INSERT INTO loan_schedule (loan_id, installment_no, due_date, amount, principal_component, interest_component, penalty_component, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [loanId, row.installment_no, row.due_date, row.amount, row.principal_component, row.interest_component, row.penalty_component]
      );
    }
    await conn.commit();
    return { loanId, schedule };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.receivePayment = async (data, userId) => {
  const { loan_id, amount, payment_mode, transaction_reference, remarks, payment_date, penalty_paid, interest_paid, principal_paid } = data;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [loans] = await conn.execute(`SELECT * FROM loans WHERE id=?`, [loan_id]);
    if (!loans.length) throw new Error("Loan not found");

    const targetDate = payment_date ? new Date(payment_date) : new Date();
    const payment = await paymentRepo.create(conn, {
      loan_id, amount, payment_mode, transaction_reference: transaction_reference || `UTR-${Date.now()}`, received_by: userId, remarks, payment_date: targetDate
    });

    const paymentId = payment.insertId;

    let remPenalty = penalty_paid !== undefined ? Math.round(Number(penalty_paid) * 100) : 0;
    let remInterest = interest_paid !== undefined ? Math.round(Number(interest_paid) * 100) : 0;
    let remPrincipal = principal_paid !== undefined ? Math.round(Number(principal_paid) * 100) : 0;
    const isGlobal = remPenalty === 0 && remInterest === 0 && remPrincipal === 0;
    let poolPaise = isGlobal ? Math.round(Number(amount) * 100) : 0;

    const [schedules] = await conn.execute(
      `SELECT * FROM loan_schedule WHERE loan_id=? AND status IN('PENDING','PARTIAL','OVERDUE') ORDER BY installment_no ASC`,
      [loan_id]
    );
    if (!schedules.length) throw new Error("No pending installments.");

    for (const inst of schedules) {
      if (!isGlobal) {
        if (remPenalty <= 0 && remInterest <= 0 && remPrincipal <= 0) break;
      } else {
        if (poolPaise <= 0) break;
      }

      let pDue = Math.round((Number(inst.principal_component) - Number(inst.principal_paid || 0)) * 100);
      let iDue = Math.round((Number(inst.interest_component) - Number(inst.interest_paid || 0)) * 100);
      let penDue = Math.round((Number(inst.penalty_component || 0) - Number(inst.penalty_paid || 0)) * 100);

      pDue = Math.max(0, pDue);
      iDue = Math.max(0, iDue);
      penDue = Math.max(0, penDue);

      let pPaid = Math.round(Number(inst.principal_paid || 0) * 100);
      let iPaid = Math.round(Number(inst.interest_paid || 0) * 100);
      let penPaid = Math.round(Number(inst.penalty_paid || 0) * 100);

      if (isGlobal) {
        let pay = Math.min(poolPaise, penDue);
        penPaid += pay;
        poolPaise -= pay;
        pay = Math.min(poolPaise, iDue);
        iPaid += pay;
        poolPaise -= pay;
        pay = Math.min(poolPaise, pDue);
        pPaid += pay;
        poolPaise -= pay;
      } else {
        let pay = Math.min(remPenalty, penDue);
        penPaid += pay;
        remPenalty -= pay;
        pay = Math.min(remInterest, iDue);
        iPaid += pay;
        remInterest -= pay;
        pay = Math.min(remPrincipal, pDue);
        pPaid += pay;
        remPrincipal -= pay;
      }

      const balanceLeft = pDue - (pPaid - Math.round(Number(inst.principal_paid || 0) * 100)) +
                          iDue - (iPaid - Math.round(Number(inst.interest_paid || 0) * 100)) +
                          penDue - (penPaid - Math.round(Number(inst.penalty_paid || 0) * 100));

      let status = balanceLeft <= 0 ? "PAID" : "PARTIAL";

      await conn.execute(
        `UPDATE loan_schedule SET principal_paid=?, interest_paid=?, penalty_paid=?, status=?, paid_at=CASE WHEN ?='PAID' THEN NOW() ELSE paid_at END WHERE id=?`,
        [(pPaid / 100).toFixed(2), (iPaid / 100).toFixed(2), (penPaid / 100).toFixed(2), status, status, inst.id]
      );
    }

    const [[balRow]] = await conn.execute(
      `SELECT principal_amount - IFNULL((SELECT SUM(principal_paid) FROM loan_schedule WHERE loan_id=?),0) AS balance FROM loans WHERE id=?`,
      [loan_id, loan_id]
    );
    const finalBalance = Math.max(0, Number(balRow.balance));
    await conn.execute(`UPDATE loans SET balance=? WHERE id=?`, [finalBalance.toFixed(2), loan_id]);

    if (finalBalance <= 0) {
      await conn.execute(`UPDATE loans SET status='CLOSED' WHERE id=?`, [loan_id]);
    }

    const receiptNumber = `RCPT${Date.now()}`;
    await conn.execute(`INSERT INTO receipts(payment_id, receipt_number) VALUES(?,?)`, [paymentId, receiptNumber]);
    await conn.commit();

    return { paymentId, receiptNumber, balance: finalBalance.toFixed(2) };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.applyAdminWaiver = async (payload) => {
  const { loan_id, schedule_id, type } = payload;
  if (type === 'PENALTY') {
    await db.execute(`UPDATE loan_schedule SET penalty_component = penalty_paid WHERE id = ? AND loan_id = ?`, [schedule_id, loan_id]);
  } else if (type === 'INTEREST') {
    await db.execute(`UPDATE loan_schedule SET interest_component = interest_paid WHERE id = ? AND loan_id = ?`, [schedule_id, loan_id]);
  } else {
    throw new Error("Invalid system waiver configuration structural type parameter.");
  }
  await db.execute(
    `UPDATE loan_schedule SET status = IF(principal_paid >= principal_component AND interest_paid >= interest_component AND penalty_paid >= penalty_component, 'PAID', 'PARTIAL') WHERE id = ?`,
    [schedule_id]
  );
  return { success: true };
};

exports.getPayments = async () => await paymentRepo.findAll();
exports.getPaymentById = async (id) => await paymentRepo.findById(id);
exports.getLoanPayments = async (loanId) => await paymentRepo.findByLoanId(loanId);
exports.getPaymentStats = async () => ({
  totalPayments: await paymentRepo.countAll(),
  totalCollected: await paymentRepo.totalCollection(),
  todayCollection: await paymentRepo.getTodayCollection()
});

exports.getLoanSchedule = async (loanId) => {
  const [rows] = await db.execute(
    `SELECT id, installment_no, due_date, amount, principal_component, interest_component, penalty_component, principal_paid, interest_paid, penalty_paid, status, paid_at FROM loan_schedule WHERE loan_id = ? ORDER BY installment_no ASC`, 
    [loanId]
  );
  return rows;
};