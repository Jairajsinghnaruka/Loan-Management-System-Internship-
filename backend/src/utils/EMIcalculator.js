exports.calculateEMI=(principal,rate,months)=>{
const r=rate/12/100;
const emi=(principal*r*Math.pow(1+r,months))/(Math.pow(1+r,months)-1);
return Number(emi.toFixed(2));
};