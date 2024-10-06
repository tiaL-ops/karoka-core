import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CodeView.css';

function CodeView({ codeSnippet }) {
  return (
    <div className="code-view">
      <SyntaxHighlighter language="javascript" style={solarizedlight}>
        {codeSnippet}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeView;
