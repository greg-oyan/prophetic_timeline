import React from 'react';

export default function ProgressBar({ progress, color }) {
  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%`, background: color }}
    />
  );
}
