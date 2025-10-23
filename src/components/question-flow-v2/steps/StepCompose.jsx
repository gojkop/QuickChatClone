import React from 'react';
import QuickConsultComposer from '../compose/QuickConsultComposer';
import DeepDiveComposer from '../compose/DeepDiveComposer';

function StepCompose({ expert, tierType, tierConfig, composeData, onUpdate, onContinue }) {
  // Default to Quick Consult if no tier specified (for direct navigation)
  const isQuickConsult = !tierType || tierType === 'quick_consult';

  return (
    <div>
      {isQuickConsult ? (
        <QuickConsultComposer
          expert={expert}
          tierConfig={tierConfig || {
            price_cents: expert.price_cents,
            sla_hours: expert.sla_hours
          }}
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