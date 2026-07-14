const db=require('../config/db');

exports.getStats = async () => {
  const [customers] = await db.execute(`SELECT COUNT(*) totalCustomers FROM customers`);
  const [loans] = await db.execute(`SELECT COUNT(*) totalLoans FROM loans`);
  
  const [activeLoans] = await db.execute(`SELECT COUNT(*) activeLoans FROM loans WHERE status='APPROVED'`);
  const [closedLoans] = await db.execute(`SELECT COUNT(*) closedLoans FROM loans WHERE status='CLOSED'`);
  const [pendingLoans] = await db.execute(`SELECT COUNT(*) pendingLoans FROM loans WHERE status='PENDING'`);
  const [collections] = await db.execute(`SELECT IFNULL(SUM(amount),0) totalCollections FROM payments`);
  
  const [outstanding] = await db.execute(`SELECT IFNULL(SUM(principal_amount),0) outstandingBalance FROM loans WHERE status='APPROVED'`);
  
  const [monthly] = await db.execute(`SELECT IFNULL(SUM(amount),0) monthlyCollections FROM payments WHERE MONTH(payment_date)=MONTH(CURDATE()) AND YEAR(payment_date)=YEAR(CURDATE())`);
  const [overdue] = await db.execute(`SELECT COUNT(*) overdueInstallments FROM loan_schedule WHERE status='OVERDUE'`);

  return {
    totalCustomers: customers[0].totalCustomers,
    totalLoans: loans[0].totalLoans,
    activeLoans: activeLoans[0].activeLoans,
    closedLoans: closedLoans[0].closedLoans,
    pendingLoans: pendingLoans[0].pendingLoans,
    totalCollections: collections[0].totalCollections,
    outstandingBalance: outstanding[0].outstandingBalance,
    monthlyCollections: monthly[0].monthlyCollections,
    overdueInstallments: overdue[0].overdueInstallments
  };
};
exports.getRecentLoans=async()=>{
const[rows]=await db.execute(`SELECT l.id,l.loan_number,l.principal_amount,l.status,c.name customer_name FROM loans l JOIN customers c ON l.customer_id=c.id ORDER BY l.id DESC LIMIT 10`);
return rows;
};

exports.getRecentPayments=async()=>{
const[rows]=await db.execute(`SELECT p.id,p.amount,p.payment_date,l.loan_number FROM payments p JOIN loans l ON p.loan_id=l.id ORDER BY p.id DESC LIMIT 10`);
return rows;
};

exports.getMonthlyCollections=async()=>{
const[rows]=await db.execute(`SELECT MONTH(payment_date) month,IFNULL(SUM(amount),0) amount FROM payments WHERE YEAR(payment_date)=YEAR(CURDATE()) GROUP BY MONTH(payment_date) ORDER BY MONTH(payment_date)`);
return rows;
};

exports.getLoanDistribution=async()=>{
const[rows]=await db.execute(`SELECT loan_type,COUNT(*) total FROM loans GROUP BY loan_type`);
return rows;
};