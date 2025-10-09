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
  { typeName: 'Medical' },
  { typeName: 'Food' },
  { typeName: 'Office Equipment' },
  { typeName: 'Miscellaneous' },
];

// Import data into DB
const importData = async () => {
  try {
    await RoleMaster.deleteMany();
    await StatusMaster.deleteMany();
    await ClaimTypeMaster.deleteMany();
    await ApprovalRule.deleteMany();
    await User.deleteMany();
    await Claim.deleteMany();

    const createdRoles = await RoleMaster.insertMany(roles);
    const createdStatuses = await StatusMaster.insertMany(statuses);
    const createdClaimTypes = await ClaimTypeMaster.insertMany(claimTypes);

    const employeeRole = createdRoles.find((r) => r.roleName === 'Employee');
    const managerRole = createdRoles.find((r) => r.roleName === 'Manager');
    const financeOfficerRole = createdRoles.find((r) => r.roleName === 'Finance Officer');
    const adminFinanceHeadRole = createdRoles.find((r) => r.roleName === 'Admin/Finance Head');
    const systemAdminRole = createdRoles.find((r) => r.roleName === 'System Admin');

    const systemAdmin = await User.create({
        name: 'System Admin User',
        email: 'sysadmin@example.com',
        password: '123456',
        role: systemAdminRole._id,
    });

    const adminFinanceHead = await User.create({
        name: 'Admin Finance Head User',
        email: 'admin@example.com',
        password: '123456',
        role: adminFinanceHeadRole._id,
        manager: systemAdmin._id,
    });

    const financeOfficer = await User.create({
        name: 'Finance Officer User',
        email: 'finance@example.com',
        password: '123456',
        role: financeOfficerRole._id,
        manager: adminFinanceHead._id,
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: '123456',
      role: managerRole._id,
      manager: financeOfficer._id,
    });

    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@example.com',
      password: '123456',
      role: employeeRole._id,
      manager: manager._id,
    });

    const travelType = createdClaimTypes.find((ct) => ct.typeName === 'Travel');
    const medicalType = createdClaimTypes.find((ct) => ct.typeName === 'Medical');
    const foodType = createdClaimTypes.find((ct) => ct.typeName === 'Food');
    const officeEquipmentType = createdClaimTypes.find((ct) => ct.typeName === 'Office Equipment');
    const miscellaneousType = createdClaimTypes.find((ct) => ct.typeName === 'Miscellaneous');

    const approvalRules = [
      // Travel
      {
        claimType: travelType._id,
        amountMin: 0,
        amountMax: Infinity,
        approvers: [
          { approverId: managerRole._id, level: 1 },
          { approverId: financeOfficerRole._id, level: 2 },
        ],
      },
      // Medical
      {
        claimType: medicalType._id,
        amountMin: 0,
        amountMax: 9999.99,
        approvers: [
            { approverId: managerRole._id, level: 1 },
            { approverId: financeOfficerRole._id, level: 2 },
        ],
      },
      {
        claimType: medicalType._id,
        amountMin: 10000,
        amountMax: Infinity,
        approvers: [
          { approverId: managerRole._id, level: 1 },
          { approverId: financeOfficerRole._id, level: 2 },
          { approverId: adminFinanceHeadRole._id, level: 3 },
        ],
      },
      // Food
      {
        claimType: foodType._id,
        amountMin: 0,
        amountMax: 1000,
        approvers: [{ approverId: managerRole._id, level: 1 }],
      },
      {
        claimType: foodType._id,
        amountMin: 1001,
        amountMax: Infinity,
        approvers: [
            { approverId: managerRole._id, level: 1 },
            { approverId: financeOfficerRole._id, level: 2 },
        ],
      },
      // Office Equipment
      {
        claimType: officeEquipmentType._id,
        amountMin: 0,
        amountMax: 9999.99,
        approvers: [
            { approverId: managerRole._id, level: 1 },
            { approverId: financeOfficerRole._id, level: 2 },
        ],
      },
      {
        claimType: officeEquipmentType._id,
        amountMin: 10000,
        amountMax: Infinity,
        approvers: [
          { approverId: managerRole._id, level: 1 },
          { approverId: financeOfficerRole._id, level: 2 },
          { approverId: adminFinanceHeadRole._id, level: 3 },
        ],
      },
      // Miscellaneous
      {
        claimType: miscellaneousType._id,
        amountMin: 0,
        amountMax: Infinity,
        approvers: [{ approverId: managerRole._id, level: 1 }],
      },
    ];

    await ApprovalRule.insertMany(approvalRules);

        console.log('Data Imported!');

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

      } catch (err) {

        console.error(err);

        process.exit(1);

      }

    };

    

    const run = async () => {

        await connectDB();

        if (process.argv[2] === '-i') {

            await importData();

        } else if (process.argv[2] === '-d') {

            await deleteData();

        }

        process.exit();

    }

    

    run();