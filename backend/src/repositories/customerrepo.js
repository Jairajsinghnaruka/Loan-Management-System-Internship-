const db = require('../config/db');

exports.create = async (data) => {
  const { name, phone, email, aadhaar, pan, address, occupation, monthly_income } = data;
  const query = `INSERT INTO customers (name, phone, email, aadhaar, pan, address, occupation, monthly_income) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await db.execute(query, [name, phone, email, aadhaar, pan, address, occupation, monthly_income]);
  return result;
};

exports.findAll = async (limit, offset, search) => {
  const [rows] = await db.execute(
    `SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`,
    [`%${search}%`, `%${search}%`, limit, offset]
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM customers WHERE id = ?`, [id]);
  return rows[0];
};

exports.update = async (id, data) => {
  const { name, phone, email, aadhaar, pan, address, occupation, monthly_income } = data;
  return db.execute(
    `UPDATE customers SET name = ?, phone = ?, email = ?, aadhaar = ?, pan = ?, address = ?, occupation = ?, monthly_income = ? WHERE id = ?`,
    [name, phone, email, aadhaar, pan, address, occupation, monthly_income, id]
  );
};

exports.delete = async (id) => {
  return db.execute(`DELETE FROM customers WHERE id = ?`, [id]);
};

exports.count = async (search) => {
  const [rows] = await db.execute(
    `SELECT COUNT(*) total FROM customers WHERE name LIKE ? OR phone LIKE ?`,
    [`%${search}%`, `%${search}%`]
  );
  return rows[0].total;
};