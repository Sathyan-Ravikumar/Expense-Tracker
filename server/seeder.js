const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Load models
const RoleMaster = require('./models/RoleMaster');
const StatusMaster = require('./models/StatusMaster');
const ClaimTypeMaster = require('./models/ClaimTypeMaster');
const ApprovalRule = require('./models/ApprovalRule');
const User = require('./models/User');

// Connect to DB
connectDB();

// Sample Data
const roles = [
  { roleName: 'Employee' },
  { roleName: 'Manager' },
  { roleName: 'Finance Officer' },
  { roleName: 'Admin/Finance Head' },
  { roleName: 'System Admin' },
];

const statuses = [
  { statusName: 'Pending' },
  { statusName: 'Approved' },
  { statusName: 'Rejected' },
  { statusName: 'Returned' },
  { statusName: 'Reimbursed' },
];

const claimTypes = [
  { typeName: 'Travel' },
  { typeName: 'Food' },
  { typeName: 'Accommodation' },
  { typeName: 'Other' },
];

// Import data into DB
const importData = async () => {
  try {
    await RoleMaster.deleteMany();
    await StatusMaster.deleteMany();
    await ClaimTypeMaster.deleteMany();
    await ApprovalRule.deleteMany();
    await User.deleteMany();

    const createdRoles = await RoleMaster.insertMany(roles);
    const createdStatuses = await StatusMaster.insertMany(statuses);
    const createdClaimTypes = await ClaimTypeMaster.insertMany(claimTypes);

    const employeeRole = createdRoles.find((role) => role.roleName === 'Employee');
    const managerRole = createdRoles.find((role) => role.roleName === 'Manager');

    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@example.com',
      password: '123456',
      role: employeeRole._id,
      team: 'Team A',
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: '123456',
      role: managerRole._id,
      team: 'Team A',
    });

    const approvalRules = [
      {
        claimType: createdClaimTypes.find((ct) => ct.typeName === 'Travel')._id,
        amountMin: 0,
        amountMax: 1000,
        approvers: [{ approverId: managerRole._id, level: 1 }],
      },
      {
        claimType: createdClaimTypes.find((ct) => ct.typeName === 'Food')._id,
        amountMin: 0,
        amountMax: 500,
        approvers: [{ approverId: managerRole._id, level: 1 }],
      },
    ];

    await ApprovalRule.insertMany(approvalRules);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await RoleMaster.deleteMany();
    await StatusMaster.deleteMany();
    await ClaimTypeMaster.deleteMany();
    await ApprovalRule.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
