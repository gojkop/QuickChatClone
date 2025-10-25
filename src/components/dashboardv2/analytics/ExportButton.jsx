import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportAnalyticsCSV } from '@/utils/dashboardv2/analyticsCalculator';

function ExportButton({ analytics, questions }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    const csv = exportAnalyticsCSV(analytics, questions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
      >
        <Download size={16} />
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
            <div className="py-1">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileSpreadsheet size={16} className="text-green-600" />
                Export as CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText size={16} className="text-red-600" />
                Export as PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExportButton;