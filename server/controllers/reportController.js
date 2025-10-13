const Claim = require('../models/Claim');
const User = require('../models/User');
const ClaimTypeMaster = require('../models/ClaimTypeMaster');
const ExcelJS = require('exceljs');

// @desc    Generate reports
// @route   GET /api/reports
// @access  Private/Manager, Private/Finance Officer, Private/Admin
exports.generateReport = async (req, res, next) => {
  const { reportType } = req.query;

  try {
    let data;
    let headers;

    switch (reportType) {
      case 'department':
        data = await Claim.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $group: {
              _id: '$user.department',
              totalAmount: { $sum: '$amount' },
              claimCount: { $sum: 1 },
            },
          },
          {
            $project: {
              department: '$_id',
              totalAmount: 1,
              claimCount: 1,
              _id: 0,
            },
          },
        ]);
        headers = [
          { header: 'Department', key: 'department', width: 30 },
          { header: 'Total Amount', key: 'totalAmount', width: 15 },
          { header: 'Claim Count', key: 'claimCount', width: 15 },
        ];
        break;

      case 'category':
        data = await Claim.aggregate([
          {
            $lookup: {
              from: 'claimtypemasters',
              localField: 'claimType',
              foreignField: '_id',
              as: 'claimType',
            },
          },
          {
            $unwind: '$claimType',
          },
          {
            $group: {
              _id: '$claimType.typeName',
              totalAmount: { $sum: '$amount' },
              claimCount: { $sum: 1 },
            },
          },
          {
            $project: {
              category: '$_id',
              totalAmount: 1,
              claimCount: 1,
              _id: 0,
            },
          },
        ]);
        headers = [
            { header: 'Category', key: 'category', width: 30 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Claim Count', key: 'claimCount', width: 15 },
        ];
        break;

      case 'timeline':
        data = await Claim.find({})
          .populate('user', 'name email')
          .populate('claimType', 'typeName')
          .populate('status', 'statusName')
          .populate({
            path: 'approvalHistory.approver',
            select: 'name email'
          })
          .populate('approvalHistory.status', 'statusName');

        data = data.map(claim => {
            const lastAction = claim.approvalHistory && claim.approvalHistory.length > 0 ? claim.approvalHistory[claim.approvalHistory.length - 1] : null;
            let actionBy = '';
            if (lastAction && (claim.status.statusName === 'Approved' || claim.status.statusName === 'Rejected' || claim.status.statusName === 'Returned')) {
                actionBy = lastAction.approver.email;
            }

            return {
              claimId: claim.claimId,
              employeeName: claim.user.name,
              employeeEmail: claim.user.email,
              claimType: claim.claimType.typeName,
              amount: claim.amount,
              status: claim.status.statusName,
              submittedDate: claim.createdAt,
              actionBy: actionBy,
              approvalHistory: claim.approvalHistory.map(h => `Approver: ${h.approver.name}, Status: ${h.status.statusName}, Date: ${h.date}`).join(' | ')
            }
        });
        headers = [
            { header: 'Claim ID', key: 'claimId', width: 20 },
            { header: 'Employee Name', key: 'employeeName', width: 30 },
            { header: 'Employee Email', key: 'employeeEmail', width: 30 },
            { header: 'Claim Type', key: 'claimType', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Submitted Date', key: 'submittedDate', width: 20 },
            { header: 'Action By', key: 'actionBy', width: 30 },
            { header: 'Approval History', key: 'approvalHistory', width: 100 },
        ];
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = headers;

    // Make headers bold
    worksheet.getRow(1).font = { bold: true };

    worksheet.addRows(data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${reportType}-report.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
