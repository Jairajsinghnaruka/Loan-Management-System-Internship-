exports.addMonths=(date,months)=>{
const d=new Date(date);
d.setMonth(d.getMonth()+months);
return d;
};

exports.formatDate=(date)=>{
return new Date(date).toISOString().split('T')[0];
};

exports.isOverdue=(date)=>{
return new Date(date)<new Date();
};