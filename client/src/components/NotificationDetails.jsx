import React from 'react';

function NotificationDetails({ notification }) {
  const { action, details } = notification;

  if (!details) {
    return null;
  }

  switch (action) {
    case 'user_created':
      return (
        <div>
          <p><strong>Email:</strong> {details.email}</p>
        </div>
      );
    case 'user_updated':
      return (
        <div>
          <p><strong>Previous:</strong></p>
          <p>Email: {details.previous.email}, Role: {details.previous.role}</p>
          <p><strong>New:</strong></p>
          <p>Email: {details.new.email}, Role: {details.new.role}</p>
        </div>
      );
    case 'user_deleted':
      return (
        <div>
          <p><strong>Email:</strong> {details.email}</p>
        </div>
      );
    case 'approval_rule_created':
      return (
        <div>
          <p><strong>Claim Type:</strong> {details.claimType}</p>
          <p><strong>Amount:</strong> {details.amountMin} - {details.amountMax}</p>
        </div>
      );
    case 'approval_rule_updated':
        return (
            <div>
                <p><strong>Previous:</strong></p>
                <p>Claim Type: {details.previous.claimType}, Amount: {details.previous.amountMin} - {details.previous.amountMax}</p>
                <p><strong>New:</strong></p>
                <p>Claim Type: {details.new.claimType}, Amount: {details.new.amountMin} - {details.new.amountMax}</p>
            </div>
        );
    case 'approval_rule_deleted':
        return (
            <div>
                <p><strong>Claim Type:</strong> {details.claimType}</p>
                <p><strong>Amount:</strong> {details.amountMin} - {details.amountMax}</p>
            </div>
        );
    default:
      return null;
  }
}

export default NotificationDetails;
