const db=require('../config/db');

exports.log=async(user_id,action,entity_type,entity_id)=>{
await db.execute(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id)VALUES(?,?,?,?)`,[user_id,action,entity_type,entity_id]);
};

exports.getLogs=async(page=1,limit=20)=>{
const offset=(page-1)*limit;
const[rows]=await db.execute(`SELECT a.*,u.name user_name FROM audit_logs a LEFT JOIN users u ON a.user_id=u.id ORDER BY a.id DESC LIMIT ? OFFSET ?`,[Number(limit),Number(offset)]);
return rows;
};

exports.getUserLogs=async(userId)=>{
const[rows]=await db.execute(`SELECT * FROM audit_logs WHERE user_id=? ORDER BY id DESC`,[userId]);
return rows;
};

exports.deleteLogs=async()=>{
await db.execute(`DELETE FROM audit_logs`);
return true;
};