import React from 'react';
import ReactFlow, { Handle } from 'reactflow';
import 'reactflow/dist/style.css';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import graphTopics from '../../data/topics/graphTopics';
import linkedListTopics from '../../data/topics/linkedListTopics';
import treeTopics from '../../data/topics/treeTopics';

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node">
      <h3>{data.label}</h3>
      <div className="button-container">
        <button className="learn-btn" onClick={() => data.onLearnSelect(data.id)}>Learn</button>
        <button className="quiz-btn" onClick={() => data.onQuizSelect(data.id)}>Quiz</button>
      </div>
      <Handle type="source" position="right" style={{ background: '#fff' }} />
      <Handle type="target" position="left" style={{ background: '#fff' }} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function HomePage() {
  const navigate = useNavigate();

  const handleLearnSelect = (topic) => {
    switch (topic) {
      case 'dfs-bfs':
        navigate('/learn/dfs-bfs');
        break;
      case 'linked-list':
        navigate('/learn/linked-list');
        break;
      case 'binary-tree':
        navigate('/learn/binary-tree');
        break;
      default:
        console.error('Unknown topic');
    }
  };

  const handleQuizSelect = (topic) => {
    navigate(`/topic/${topic}/quiz`);
  };

  const nodes = [
    {
      id: 'dfs-bfs',
      data: { 
        label: 'DFS and BFS', 
        color: '#3b82f6', 
        onLearnSelect: handleLearnSelect, 
        onQuizSelect: handleQuizSelect, 
        id: 'dfs-bfs' 
      },
      position: { x: 200, y: 50 }, 
      type: 'custom',
    },
    {
      id: 'linked-list',
      data: { 
        label: 'Linked List', 
        color: '#f59e0b', 
        onLearnSelect: handleLearnSelect, 
        onQuizSelect: handleQuizSelect, 
        id: 'linked-list' 
      },
      position: { x: 200, y: 300 },
      type: 'custom',
    },
    {
      id: 'binary-tree',
      data: { 
        label: 'Binary Tree', 
        color: '#10b981', 
        onLearnSelect: handleLearnSelect, 
        onQuizSelect: handleQuizSelect, 
        id: 'binary-tree' 
      },
      position: { x: 200, y: 550 },
      type: 'custom',
    }
  ];

  const edges = [
    { id: 'e1-2', source: 'dfs-bfs', target: 'linked-list', type: 'smoothstep', animated: true, style: { stroke: '#bbb', strokeDasharray: '5 5' } },
    { id: 'e2-3', source: 'linked-list', target: 'binary-tree', type: 'smoothstep', animated: true, style: { stroke: '#bbb', strokeDasharray: '5 5' } }
  ];

  return (
    <div className="home-container">
      <h1>Data Structures & Algorithms Pathway</h1>

      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
        />
      </div>
    </div>
  );
}

export default HomePage;
