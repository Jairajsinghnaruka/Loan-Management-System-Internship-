const db = require('../config/db');

exports.create = async (conn, data) => {
  let type = String(data.loan_type).toUpperCase();
  if (type === 'AUTO') type = 'VEHICLE';

  const [result] = await conn.execute(
    `INSERT INTO loans(customer_id, principal_amount, interest_rate, tenure_months, emi_amount, total_amount, balance, loan_type) VALUES(?,?,?,?,?,?,?,?)`,
    [data.customer_id, data.principal_amount, data.interest_rate, data.tenure_months, data.emi_amount, data.total_amount, data.balance, type]
  );
  return result;
};

exports.findAll = async () => {
  const [rows] = await db.execute(
    `SELECT l.*, c.name customer_name FROM loans l JOIN customers c ON l.customer_id = c.id ORDER BY l.id DESC`
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM loans WHERE id=?`, [id]);
  return rows[0];
};

exports.approve = async (id, userId) => {
  return db.execute(`UPDATE loans SET status='APPROVED', approved_by=?, approved_at=NOW() WHERE id=?`, [userId, id]);
};

exports.reject = async (id) => {
  return db.execute(`UPDATE loans SET status='REJECTED' WHERE id=?`, [id]);
};

exports.close = async (id) => {
  return db.execute(`UPDATE loans SET status='CLOSED', balance=0 WHERE id=?`, [id]);
};

exports.updateBalance = async (id, balance) => {
  return db.execute(`UPDATE loans SET balance=? WHERE id=?`, [balance, id]);
};

exports.deleteLoan = async (loanId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(`DELETE FROM loan_schedule WHERE loan_id = ?`, [loanId]);
    
    const [result] = await conn.execute(`DELETE FROM loans WHERE id = ?`, [loanId]);
    
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    console.error("SQL Error in deleteLoan:", error); 
    throw error;
  } finally {
    conn.release();
  }
};