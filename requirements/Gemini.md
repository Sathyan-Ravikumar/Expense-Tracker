# Gemini CLI Instructions – Expense Tracker / Reimbursement Portal

## Objective
Generate a full-stack web application (React.js frontend + Node.js/Express backend + MongoDB) for Expense Tracker / Reimbursement Portal.

## Frontend Requirements
- Folder: `client/`
- React functional components (.jsx)
- React Router for page navigation
- Redux Toolkit for state management
- Tailwind CSS for styling
- Session storage to persist JWT token
- Pages: 
  - EmployeeDashboard, ManagerDashboard, FinanceDashboard, AdminDashboard, Login, ClaimForm, Reports, Notifications
- Components:
  - Header, Sidebar, ClaimCard, ApprovalModal, NotificationToast, FormInputs
- Apply color palette from `technicaldetails.json`
- Fully responsive using Tailwind
- API integration with Axios

## Backend Requirements
- Folder: `server/`
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication & Role-based access
- Models: User, Claim, Role, ApprovalRule, AuditLog
- Routes: 
  - /claims, /users, /roles, /approval-rules, /audit-logs, /reports
- Controllers & services per model
- Validation middleware & error handling
- Notifications via email/SMS

## Workflow
- Implement approval workflows from `workflow.json`
- Multi-level approvals based on claim type and thresholds
- Employee can submit/edit/delete claims (before approval)
- Managers/Finance/Admin can approve/reject/return claims
- Notifications sent via email & in-app

## Folder Structure
- Use structure defined in `technicaldetails.json`
- Frontend: client/components, client/pages, client/features, client/services, client/store, client/utils
- Backend: server/controllers, server/models, server/routes, server/middlewares, server/utils, server/config

## Endpoints
- Follow endpoints defined in `endpoints.json`
- Include CRUD operations, approval actions, user management, reporting, and audit logs

## Styling & Design
- Tailwind CSS for all styling
- Responsive layouts
- Use color palette from `technicaldetails.json`
- Clean UI with modals, forms, tables, notifications
