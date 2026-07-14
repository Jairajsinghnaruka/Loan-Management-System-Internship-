const customerService=require('../services/customerService');

exports.createCustomer=async(req,res,next)=>{
try{
const result=await customerService.createCustomer(req.body);
res.status(201).json({success:true,...result});
}catch(error){
next(error);
}
};


exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = await customerService.getCustomers(page, limit, search);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCustomer=async(req,res,next)=>{
try{
await customerService.updateCustomer(req.params.id,req.body);
res.json({success:true,message:'Customer updated'});
}catch(error){
next(error);
}
};

exports.deleteCustomer=async(req,res,next)=>{
try{
await customerService.deleteCustomer(req.params.id);
res.json({success:true,message:'Customer deleted'});
}catch(error){
next(error);
}
};

exports.getCustomerLoans=async(req,res,next)=>{
try{
const loans=await customerService.getCustomerLoans(req.params.id);
res.json({success:true,loans});
}catch(error){
next(error);
}
};

exports.getCustomerStats=async(req,res,next)=>{
try{
const stats=await customerService.getCustomerStats(req.params.id);
res.json({success:true,stats});
}catch(error){
next(error);
}
};