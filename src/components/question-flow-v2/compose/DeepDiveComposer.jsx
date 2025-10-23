import React from 'react';

function DeepDiveComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  return (
    <div className="p-6 text-center text-gray-500">
      <p>Deep Dive composer coming in Phase 3</p>
      <button
        onClick={onContinue}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Continue (Mock)
      </button>
    </div>
  );
}

export default DeepDiveComposer;