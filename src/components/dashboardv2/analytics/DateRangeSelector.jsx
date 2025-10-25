import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

function DateRangeSelector({ dateRange, onPresetChange, onCustomChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('30d');

  const presets = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
  ];

  const handlePresetClick = (value) => {
    setActivePreset(value);
    onPresetChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {presets.find(p => p.value === activePreset)?.label || 'Select range'}
        </span>
        <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
            <div className="py-1">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    ${activePreset === preset.value
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DateRangeSelector;