const db=require('../config/db');

exports.create=async(data)=>{
const{name,email,password,role,phone}=data;
const[result]=await db.execute(`INSERT INTO users(name,email,password,role,phone)VALUES(?,?,?,?,?)`,[name,email,password,role,phone]);
return result;
};

exports.findByEmail=async(email)=>{
const[rows]=await db.execute(`SELECT * FROM users WHERE email=?`,[email]);
return rows[0];
};

exports.findById=async(id)=>{
const[rows]=await db.execute(`SELECT id,name,email,role,phone,status,created_at FROM users WHERE id=?`,[id]);
return rows[0];
};

exports.findAll=async()=>{
const[rows]=await db.execute(`SELECT id,name,email,role,phone,status FROM users ORDER BY id DESC`);
return rows;
};

exports.updateStatus=async(id,status)=>{
return db.execute(`UPDATE users SET status=? WHERE id=?`,[status,id]);
};