const reportService = require('../services/reportservice');

exports.loanReport = async (req, res, next) => {
  try {
    const rawReport = await reportService.loanReport();
    
    const report = rawReport.map(loan => ({
      id: Number(loan.id),
      customer: String(loan.customer || 'N/A'),
      amount: Number(loan.amount || 0),
      rate: Number(loan.rate || 0),
      months: Number(loan.months || 0),
      createdDate: String(loan.createdDate),
      status: String(loan.status)
    }));

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.collectionReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const report = await reportService.collectionReport(from, to);
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.customerReport = async (req, res, next) => {
  try {
    const report = await reportService.customerReport();
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.overdueReport = async (req, res, next) => {
  try {
    const report = await reportService.overdueReport();
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.activeLoanReport = async (req, res, next) => {
  try {
    const report = await reportService.activeLoanReport();
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.closedLoanReport = async (req, res, next) => {
  try {
    const report = await reportService.closedLoanReport();
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.monthlyCollectionReport = async (req, res, next) => {
  try {
    const report = await reportService.monthlyCollectionReport();
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};