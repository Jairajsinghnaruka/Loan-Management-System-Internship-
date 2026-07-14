const dashboardService=require('../services/dashboardservice');

exports.getStats=async(req,res,next)=>{
try{
const stats=await dashboardService.getStats();
res.json({success:true,stats});
}catch(error){
next(error);
}
};

exports.getRecentLoans=async(req,res,next)=>{
try{
const loans=await dashboardService.getRecentLoans();
res.json({success:true,loans});
}catch(error){
next(error);
}
};

exports.getRecentPayments=async(req,res,next)=>{
try{
const payments=await dashboardService.getRecentPayments();
res.json({success:true,payments});
}catch(error){
next(error);
}
};

exports.getMonthlyCollections=async(req,res,next)=>{
try{
const collections=await dashboardService.getMonthlyCollections();
res.json({success:true,collections});
}catch(error){
next(error);
}
};

exports.getLoanDistribution=async(req,res,next)=>{
try{
const distribution=await dashboardService.getLoanDistribution();
res.json({success:true,distribution});
}catch(error){
next(error);
}
};