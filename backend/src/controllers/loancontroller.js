const loanService = require('../services/loanservice');

exports.issueLoan = async (req, res, next) => {
  try {
    const result = await loanService.createLoan(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getLoans = async (req, res, next) => {
  try {
    const loans = await loanService.getLoans();
    res.json({ success: true, loans });
  } catch (error) {
    next(error);
  }
};

exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await loanService.getLoanById(req.params.id);
    res.json({ success: true, loan });
  } catch (error) {
    next(error);
  }
};

exports.approveLoan = async (req, res, next) => {
  try {
    await loanService.approveLoan(req.params.id, req.user.id);
    res.json({ success: true, message: 'Loan approved and schedule generated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.rejectLoan = async (req, res, next) => {
  try {
    await loanService.rejectLoan(req.params.id);
    res.json({ success: true, message: 'Loan rejected' });
  } catch (error) {
    next(error);
  }
};

exports.closeLoan = async (req, res, next) => {
  try {
    await loanService.closeLoan(req.params.id);
    res.json({ success: true, message: 'Loan closed' });
  } catch (error) {
    next(error);
  }
};

exports.getLoanStats = async (req, res, next) => {
  try {
    const stats = await loanService.getLoanStats();
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};


const loanservice = require('../services/loanservice');

exports.deleteLoan = async (req, res) => {
  try {
    const deleted = await loanService.removeLoan(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Loan not found" });
    res.json({ success: true, message: "Loan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};