const db = require('../config/db');

exports.createCustomer = async (data) => {
  const { name, phone, email, aadhaar, pan, address, occupation, monthly_income } = data;
  const [result] = await db.execute(
    `INSERT INTO customers(name, phone, email, aadhaar, pan, address, occupation, monthly_income) VALUES(?,?,?,?,?,?,?,?)`,
    [name, phone, email, aadhaar, pan, address, occupation, monthly_income]
  );
  return { id: result.insertId };
};


exports.getCustomers = async (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  const [customers] = await db.query(
    `SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    [`%${search}%`, `%${search}%`]
  );
  const [count] = await db.execute(
    `SELECT COUNT(*) total FROM customers WHERE name LIKE ? OR phone LIKE ?`,
    [`%${search}%`, `%${search}%`]
  );
  return { customers, total: count[0].total, page: Number(page), limit: Number(limit) };
};

exports.getCustomerById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM customers WHERE id=?`, [id]);
  return rows[0];
};
exports.updateCustomer = async (id, data) => {
  const { name, phone, email, aadhaar, pan, address, occupation, monthly_income } = data;
  await db.execute(
    `UPDATE customers SET name=?, phone=?, email=?, aadhaar=?, pan=?, address=?, occupation=?, monthly_income=? WHERE id=?`,
    [name, phone, email, aadhaar, pan, address, occupation, monthly_income, id]
  );
  return true;
};

exports.deleteCustomer = async (id) => {
  await db.execute(`DELETE FROM customers WHERE id=?`, [id]);
  return true;
};

exports.getCustomerLoans = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM loans WHERE customer_id=? ORDER BY id DESC`, [id]);
  return rows;
};

exports.getCustomerStats = async (id) => {
  const [loanCount] = await db.execute(`SELECT COUNT(*) totalLoans FROM loans WHERE customer_id=?`, [id]);
  const [activeLoans] = await db.execute(`SELECT COUNT(*) activeLoans FROM loans WHERE customer_id=? AND status='ACTIVE'`, [id]);
  const [totalBorrowed] = await db.execute(`SELECT IFNULL(SUM(principal_amount),0) totalBorrowed FROM loans WHERE customer_id=?`, [id]);
  return { totalLoans: loanCount[0].totalLoans, activeLoans: activeLoans[0].activeLoans, totalBorrowed: totalBorrowed[0].totalBorrowed };
};