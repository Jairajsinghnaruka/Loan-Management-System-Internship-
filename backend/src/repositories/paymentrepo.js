const db = require('../config/db');

exports.create = async (conn, data) => {
  const targetDate = data.payment_date ? new Date(data.payment_date) : new Date();
  const [result] = await conn.execute(
    `INSERT INTO payments(loan_id, amount, payment_mode, transaction_reference, received_by, remarks, payment_date) 
     VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [
      data.loan_id, 
      data.amount, 
      data.payment_mode, 
      data.transaction_reference, 
      data.received_by, 
      data.remarks || 'Processed via core waterfall settlement algorithm',
      targetDate
    ]
  );
  return result;
};

exports.findAll = async () => {
  const [rows] = await db.execute(
    `SELECT p.*, l.loan_number, u.name as received_by_name 
     FROM payments p 
     JOIN loans l ON p.loan_id = l.id 
     LEFT JOIN users u ON p.received_by = u.id 
     ORDER BY p.id DESC`
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.execute(
    `SELECT p.*, l.loan_number, r.receipt_number 
     FROM payments p 
     JOIN loans l ON p.loan_id = l.id 
     LEFT JOIN receipts r ON p.id = r.payment_id 
     WHERE p.id = ?`,
    [id]
  );
  return rows[0];
};

exports.findByLoanId = async (loanId) => {
  const [rows] = await db.execute(
    `SELECT * FROM payments WHERE loan_id = ? ORDER BY id DESC`, 
    [loanId]
  );
  return rows;
};

exports.totalCollection = async () => {
  const [rows] = await db.execute(`SELECT IFNULL(SUM(amount), 0) as total FROM payments`);
  return rows[0].total;
};

exports.getTodayCollection = async () => {
  const [rows] = await db.execute(
    `SELECT IFNULL(SUM(amount), 0) as todayCollection 
     FROM payments 
     WHERE DATE(payment_date) = CURDATE()`
  );
  return rows[0].todayCollection;
};

exports.countAll = async () => {
  const [rows] = await db.execute(`SELECT COUNT(*) as totalPayments FROM payments`);
  return rows[0].totalPayments;
};