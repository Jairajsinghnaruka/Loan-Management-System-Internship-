const db=require('../config/db');

exports.createNotification=async(customer_id,message,type='SYSTEM')=>{
const[result]=await db.execute(`INSERT INTO notifications(customer_id,message,type)VALUES(?,?,?)`,[customer_id,message,type]);
return result.insertId;
};

exports.getNotifications=async()=>{
const[rows]=await db.execute(`SELECT n.*,c.name customer_name FROM notifications n LEFT JOIN customers c ON n.customer_id=c.id ORDER BY n.id DESC`);
return rows;
};

exports.markSent=async(id)=>{
await db.execute(`UPDATE notifications SET status='SENT' WHERE id=?`,[id]);
return true;
};

exports.markFailed=async(id)=>{
await db.execute(`UPDATE notifications SET status='FAILED' WHERE id=?`,[id]);
return true;
};

exports.getPendingNotifications=async()=>{
const[rows]=await db.execute(`SELECT * FROM notifications WHERE status='PENDING'`);
return rows;
};