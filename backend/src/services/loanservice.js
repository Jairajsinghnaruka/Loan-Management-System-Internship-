const db = require('../config/db');
const { calculateEMI } = require('../utils/emiCalculator');
const loanRepo = require('../repositories/loanrepo');

exports.createLoan = async (data) => {
  const {
    customer_id,
    principal_amount,
    interest_rate,
    tenure_months,
    loan_type
  } = data;

  const emi_amount = calculateEMI(
    principal_amount,
    interest_rate,
    tenure_months
  );

  const total_amount = Number(
    (emi_amount * tenure_months).toFixed(2)
  );

  let type = String(loan_type).toUpperCase();

  if (type === "AUTO") {
    type = "VEHICLE";
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO loans
      (customer_id,principal_amount,interest_rate,tenure_months,emi_amount,total_amount,balance,loan_type)
      VALUES(?,?,?,?,?,?,?,?)`,
      [
        customer_id,
        principal_amount,
        interest_rate,
        tenure_months,
        emi_amount,
        total_amount,
        principal_amount,
        type
      ]
    );

    const loanId = result.insertId;

    await generateLoanSchedule(loanId, conn);

    await conn.commit();

    return {
      loanId,
      emi_amount,
      total_amount
    };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.getLoans = async () => {
  const [rows] = await db.execute(
    `SELECT l.*,c.name customer_name
     FROM loans l
     JOIN customers c
     ON l.customer_id=c.id
     ORDER BY l.id DESC`
  );

  return rows;
};

exports.getLoanById = async (id) => {
  const [rows] = await db.execute(
    `SELECT l.*,c.name customer_name
     FROM loans l
     JOIN customers c
     ON l.customer_id=c.id
     WHERE l.id=?`,
    [id]
  );

  return rows[0];
};

exports.approveLoan = async (loanId) => {
  await db.execute(
    `UPDATE loans
     SET status='APPROVED'
     WHERE id=?`,
    [loanId]
  );

  return true;
};

exports.rejectLoan = async (id) => {
  await db.execute(
    `UPDATE loans
     SET status='REJECTED'
     WHERE id=?`,
    [id]
  );

  return true;
};

exports.closeLoan = async (id) => {
  await db.execute(
    `UPDATE loans
     SET status='CLOSED',
     balance=0
     WHERE id=?`,
    [id]
  );

  return true;
};

exports.getLoanStats = async () => {
  const [total] = await db.execute(
    `SELECT COUNT(*) totalLoans FROM loans`
  );

  const [active] = await db.execute(
    `SELECT COUNT(*) activeLoans
     FROM loans
     WHERE status='APPROVED'`
  );

  const [closed] = await db.execute(
    `SELECT COUNT(*) closedLoans
     FROM loans
     WHERE status='CLOSED'`
  );

  const [amount] = await db.execute(
    `SELECT IFNULL(SUM(principal_amount),0) totalAmount
     FROM loans`
  );

  return {
    totalLoans: total[0].totalLoans,
    activeLoans: active[0].activeLoans,
    closedLoans: closed[0].closedLoans,
    totalAmount: amount[0].totalAmount
  };
};

const generateLoanSchedule = async (loanId, conn) => {

  const [[loan]] = await conn.execute(
    `SELECT
      principal_amount,
      interest_rate,
      tenure_months
     FROM loans
     WHERE id=?`,
    [loanId]
  );

  if (!loan) {
    throw new Error("Loan not found");
  }

  const principal = Number(loan.principal_amount);
  const annualRate = Number(loan.interest_rate);
  const tenure = Number(loan.tenure_months);

  const monthlyRate = annualRate / 12 / 100;

  const emi =
    monthlyRate === 0
      ? principal / tenure
      : (
          principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, tenure)
        ) /
        (
          Math.pow(1 + monthlyRate, tenure) - 1
        );

  let balance = principal;

  let dueDate = new Date();

  for (let i = 1; i <= tenure; i++) {

    const interest =
      monthlyRate === 0
        ? 0
        : balance * monthlyRate;

    let principalPart = emi - interest;

    if (i === tenure) {
      principalPart = balance;
    }

    balance -= principalPart;

    dueDate.setMonth(dueDate.getMonth() + 1);

    await conn.execute(
      `INSERT INTO loan_schedule
      (
        loan_id,
        installment_no,
        due_date,
        amount,
        principal_component,
        interest_component,
        penalty_component,
        principal_paid,
        interest_paid,
        penalty_paid,
        status
      )
      VALUES
      (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        loanId,
        i,
        new Date(dueDate),
        emi.toFixed(2),
        principalPart.toFixed(2),
        interest.toFixed(2),
        0,
        0,
        0,
        0,
        "PENDING"
      ]
    );
  }
};

exports.removeLoan = async (loanId) => {

  const loan = await loanRepo.findById(loanId);

  if (loan && loan.status === "ACTIVE") {
    throw new Error(
      "Cannot delete an active loan record."
    );
  }

  return await loanRepo.deleteLoan(loanId);
};