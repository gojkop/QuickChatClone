import React from 'react';
import QuickConsultComposer from '../compose/QuickConsultComposer';
import DeepDiveComposer from '../compose/DeepDiveComposer';

function StepCompose({ expert, tierType, tierConfig, composeData, onUpdate, onContinue }) {
  const isQuickConsult = tierType === 'quick_consult';

  return (
    <div>
      {isQuickConsult ? (
        <QuickConsultComposer
          expert={expert}
          tierConfig={tierConfig}
          data={composeData}
          onUpdate={onUpdate}
          onContinue={onContinue}
        />
      ) : (
        <DeepDiveComposer
          expert={expert}
          tierConfig={tierConfig}
          data={composeData}
          onUpdate={onUpdate}
          onContinue={onContinue}
        />
      )}
    </div>
  );
}

export default StepCompose;