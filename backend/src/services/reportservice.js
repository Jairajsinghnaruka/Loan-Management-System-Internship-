const db = require('../config/db');

exports.loanReport = async () => {
  const [rows] = await db.execute(`
    SELECT 
      l.id AS id,
      c.name AS customer,
      CAST(l.principal_amount AS DECIMAL(10,2)) AS amount,
      CAST(l.interest_rate AS DECIMAL(5,2)) AS rate,
      l.tenure_months AS months,
      DATE_FORMAT(l.created_at, '%Y-%m-%d') AS createdDate,
      CASE 
        WHEN l.status = 'ACTIVE' THEN 'Active'
        WHEN l.status = 'APPROVED' THEN 'Active'
        WHEN l.status = 'CLOSED' THEN 'Closed'
        WHEN l.status = 'REJECTED' THEN 'Rejected'
        ELSE 'Pending'
      END AS status
    FROM loans l 
    JOIN customers c ON l.customer_id = c.id 
    ORDER BY l.id DESC
  `);
  return rows;
};

exports.collectionReport = async (from, to) => {
  const [rows] = await db.execute(`
    SELECT 
      p.id,
      p.amount,
      p.payment_mode,
      p.payment_date,
      l.loan_number,
      c.name AS customer_name 
    FROM payments p 
    JOIN loans l ON p.loan_id = l.id 
    JOIN customers c ON l.customer_id = c.id 
    WHERE DATE(p.payment_date) BETWEEN ? AND ? 
    ORDER BY p.payment_date DESC
  `, [from, to]);
  return rows;
};

exports.customerReport = async () => {
  const [rows] = await db.execute(`
    SELECT 
      c.*,
      COUNT(l.id) AS total_loans,
      IFNULL(SUM(l.principal_amount), 0) AS borrowed_amount 
    FROM customers c 
    LEFT JOIN loans l ON c.id = l.customer_id 
    GROUP BY c.id 
    ORDER BY c.id DESC
  `);
  return rows;
};

exports.overdueReport = async () => {
  const [rows] = await db.execute(`
    SELECT 
      ls.*,
      l.loan_number,
      c.name AS customer_name 
    FROM loan_schedule ls 
    JOIN loans l ON ls.loan_id = l.id 
    JOIN customers c ON l.customer_id = c.id 
    WHERE ls.status = 'OVERDUE' 
    ORDER BY ls.due_date ASC
  `);
  return rows;
};

exports.activeLoanReport = async () => {
  const [rows] = await db.execute(`
    SELECT 
      l.loan_number,
      c.name AS customer_name,
      l.principal_amount,
      l.balance,
      l.emi_amount 
    FROM loans l 
    JOIN customers c ON l.customer_id = c.id 
    WHERE l.status = 'ACTIVE' 
    ORDER BY l.id DESC
  `);
  return rows;
};

exports.closedLoanReport = async () => {
  const [rows] = await db.execute(`
    SELECT 
      l.loan_number,
      c.name AS customer_name,
      l.principal_amount,
      l.total_amount,
      l.approved_at 
    FROM loans l 
    JOIN customers c ON l.customer_id = c.id 
    WHERE l.status = 'CLOSED' 
    ORDER BY l.id DESC
  `);
  return rows;
};

exports.monthlyCollectionReport = async () => {
  const [rows] = await db.execute(`
    SELECT 
      YEAR(payment_date) AS year,
      MONTH(payment_date) AS month,
      IFNULL(SUM(amount), 0) AS amount 
    FROM payments 
    GROUP BY YEAR(payment_date), MONTH(payment_date) 
    ORDER BY year DESC, month DESC
  `);
  return rows;
};