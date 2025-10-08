# Expense Tracker / Reimbursement Portal

## Objective
Develop a web-based portal allowing employees to submit reimbursement claims (travel, food, medical, office expenses) and managers/finance/admin teams to approve/reject them based on claim type and approval hierarchy.

## User Roles
1. Employee – submit and track claims.
2. Manager (Level-1) – first-level approver.
3. Finance Officer (Level-2) – approves high-value or special claims.
4. Admin/Finance Head (Level-3) – final approval for exceptional claims.
5. System Admin – manages users, roles, approval rules.

## Features

### Employee Portal
- Submit new claim: Claim Type, Date, Amount, Description, Upload Bill/Receipt.
- Track claim status: Pending / Approved / Rejected / Returned.
- Edit/Delete claim (before first approval).
- Notifications when claim moves to next stage.

### Approval Workflow
- Configurable by Admin (per claim type and amount thresholds).
- Approvers can Approve, Reject, Return for correction.

### Manager/Finance/Admin Dashboards
- View pending approvals.
- Approve/Reject/Return with remarks.
- Search/filter claims.
- Generate reports: department-wise, category-wise, approval timelines.

### System Admin
- Manage users, roles, and approval rules.
- Configure thresholds.
- View global reports & audit logs.
