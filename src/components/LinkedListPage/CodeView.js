// CodeView.js
import React from 'react';
import './CodeView.css';  // Ensure this file exists and has the proper styles

const CodeView = ({ codeSnippet }) => {
  return (
    <div className="code-view">
      <pre>{codeSnippet}</pre>
    </div>
  );
};

export default CodeView;
