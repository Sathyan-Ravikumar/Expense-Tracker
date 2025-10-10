import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

function ClaimsAccordion({ claims, title, headerRenderer, rowRenderer, actionsRenderer }) {
  const [openClaimId, setOpenClaimId] = useState(null);

  const getStatusColor = (statusName) => {
    if (!statusName) return 'bg-gray-100 text-gray-800';
    if (statusName === 'Approved') return 'bg-green-100 text-green-800';
    if (statusName === 'Rejected') return 'bg-red-100 text-red-800';
    if (statusName.startsWith('Pending')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-8">
      {title && <h2 className="text-xl font-bold text-gray-800 p-4 border-b border-gray-200">{title}</h2>}
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-50">
        <div className="w-12"></div>
        {headerRenderer()}
      </div>
      <div className="space-y-2 p-2">
        {claims && claims.length > 0 ? (
          claims.map((claim) => {
            const isAccordionOpen = openClaimId === claim._id;
            const reason = (claim.status && (claim.status.statusName === 'Rejected' || claim.status.statusName === 'Returned') && claim.approvalHistory.length > 0) && claim.approvalHistory[claim.approvalHistory.length - 1].remarks;

            return (
              <div key={claim._id} className="border rounded-lg overflow-hidden transition-all duration-300">
                <div 
                  className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setOpenClaimId(isAccordionOpen ? null : claim._id)}
                >
                  <div className="w-12 text-center">
                    <FaChevronDown className={`text-gray-500 transition-transform duration-300 ${isAccordionOpen ? 'transform rotate-180' : ''}`} />
                  </div>
                  {rowRenderer(claim, getStatusColor)}
                </div>

                {isAccordionOpen && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-700 mb-2"><strong>Description:</strong> {claim.description}</p>
                        {reason && <p className="text-gray-700 mb-2"><strong>Reason:</strong> {reason}</p>}
                        {claim.attachments && claim.attachments.length > 0 && (
                          <a href={claim.attachments[0]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 font-semibold">
                            View Attachment
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        {actionsRenderer && actionsRenderer(claim)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500">No claims in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimsAccordion;
