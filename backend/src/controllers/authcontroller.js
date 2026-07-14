const authService=require('../services/authservice');

exports.register=async(req,res,next)=>{
try{
const result=await authService.register(req.body);
res.status(201).json({success:true,...result});
}catch(error){
next(error);
}
};

exports.login=async(req,res,next)=>{
try{
const result=await authService.login(req.body);
res.json({success:true,...result});
}catch(error){
next(error);
}
};

exports.profile=async(req,res,next)=>{
try{
const user=await authService.profile(req.user.id);
res.json({success:true,user});
}catch(error){
next(error);
}
};