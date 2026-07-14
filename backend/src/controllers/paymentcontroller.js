const paymentService = require('../services/paymentservice');

exports.receivePayment = async (req, res, next) => {
  try {
    const result = await paymentService.receivePayment(req.body, req.user.id);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.applyAdminWaiver = async (req, res, next) => {
  try {
    const result = await paymentService.applyAdminWaiver(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { loan_id } = req.query;
    let payments;
    
    if (loan_id) {
      payments = await paymentService.getLoanPayments(loan_id);
    } else {
      payments = await paymentService.getPayments();
    }
    
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

exports.getLoanPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getLoanPayments(req.params.loanId);
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentStats = async (req, res, next) => {
  try {
    const stats = await paymentService.getPaymentStats();
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

exports.getLoanSchedule = async (req, res, next) => {
  try {
    const { loan_id } = req.query;
    
    if (!loan_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Bad Request: Missing required query parameter loan_id" 
      });
    }

    const schedule = await paymentService.getLoanSchedule(loan_id);
    
    return res.json({ 
      success: true, 
      schedule 
    });
  } catch (error) {
    next(error);
  }
};