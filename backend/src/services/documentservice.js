const db=require('../config/db');

exports.uploadDocument=async(data)=>{
const{customer_id,document_type,file_path}=data;
const[result]=await db.execute(`INSERT INTO documents(customer_id,document_type,file_path)VALUES(?,?,?)`,[customer_id,document_type,file_path]);
return result.insertId;
};

exports.getDocuments=async(customerId)=>{
const[rows]=await db.execute(`SELECT * FROM documents WHERE customer_id=? ORDER BY id DESC`,[customerId]);
return rows;
};

exports.verifyDocument=async(id)=>{
await db.execute(`UPDATE documents SET verified=1 WHERE id=?`,[id]);
return true;
};

exports.deleteDocument=async(id)=>{
await db.execute(`DELETE FROM documents WHERE id=?`,[id]);
return true;
};

exports.getDocumentById=async(id)=>{
const[rows]=await db.execute(`SELECT * FROM documents WHERE id=?`,[id]);
return rows[0];
};