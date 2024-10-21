import React from 'react';
import ReactFlow, { Handle } from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNodeComponent = ({ data }) => {
  return (
    <div className="custom-node" style={{ background: data.color }}>
      <img src={data.icon} alt={data.label} style={{ width: 50 }} />
      <div>{data.label}</div>
      <div className="progress-bar" style={{ width: `${data.progress}%`, height: '8px', backgroundColor: '#10b981', marginTop: '10px' }} />
      <Handle type="source" position="right" style={{ background: '#555' }} />
      <Handle type="target" position="left" style={{ background: '#555' }} />
    </div>
  );
};

const elements = [
  { id: '1', data: { label: 'DFS/BFS', icon: '/icons/dfs.png', progress: 80, color: '#3b82f6' }, position: { x: 150, y: 50 }, type: 'custom' },
  { id: '2', data: { label: 'Linked List', icon: '/icons/linkedlist.png', progress: 60, color: '#f59e0b' }, position: { x: 400, y: 150 }, type: 'custom' },
  { id: '3', data: { label: 'Binary Tree', icon: '/icons/tree.png', progress: 40, color: '#10b981' }, position: { x: 650, y: 250 }, type: 'custom' },
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true }
];

const nodeTypes = { custom: CustomNodeComponent };

const FlowChart = () => (
  <div style={{ height: 500 }}>
    <ReactFlow elements={elements} nodeTypes={nodeTypes} />
  </div>
);

export default FlowChart;
