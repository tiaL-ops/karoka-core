import React from 'react';
import './DebugControls.css';

function DebugControls({ onStepForward, onStepBackward }) {
  return (
    <div className="debug-controls">
      <button onClick={onStepBackward}>Previous Step</button>
      <button onClick={onStepForward}>Next Step</button>
    </div>
  );
}

export default DebugControls;
