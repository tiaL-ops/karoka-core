import React from 'react';
import ReactFlow, { Handle } from 'reactflow';
import 'reactflow/dist/style.css';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import graphTopics from '../../data/topics/graphTopics';       // Data for Graph-related topics
import linkedListTopics from '../../data/topics/linkedListTopics'; // Data for Linked List topics
import treeTopics from '../../data/topics/treeTopics';         // Data for Tree-related topics

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node" style={{ background: data.color }}>
      <h3>{data.label}</h3>
      <button onClick={() => data.onLearnSelect(data.id)}>Learn</button>
      <button onClick={() => data.onQuizSelect(data.id)}>Quiz</button>
      <Handle type="source" position="right" style={{ background: '#555' }} />
      <Handle type="target" position="left" style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode
};

function HomePage() {
  const navigate = useNavigate();  // Initialize useNavigate

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

  // Adjusting the vertical (y) position of the nodes to give them more space
  const nodes = [
    ...graphTopics.map((topic, index) => ({
      id: `graph-${index}`,
      data: { 
        label: topic.name,
        color: '#3b82f6', 
        onLearnSelect: handleLearnSelect, 
        onQuizSelect: handleQuizSelect,
        id: topic.id 
      },
      position: { x: 150 + index * 200, y: 50 },  // X-position remains the same, Y-position gives space
      type: 'custom'
    })),
    ...linkedListTopics.map((topic, index) => ({
      id: `linked-list-${index}`,
      data: { 
        label: topic.name, 
        color: '#f59e0b', 
        onLearnSelect: handleLearnSelect, 
        onQuizSelect: handleQuizSelect,
        id: topic.id 
      },
      position: { x: 150 + index * 200, y: 300 },  // Increased Y to 300
      type: 'custom'
    })),
    ...treeTopics.map((topic, index) => ({
      id: `tree-${index}`,
      data: { 
        label: topic.name, 
        color: '#10b981', 
        onLearnSelect: handleLearnSelect, 
        onQuizSelect: handleQuizSelect,
        id: topic.id 
      },
      position: { x: 150 + index * 200, y: 550 },  // Increased Y to 550 for more space
      type: 'custom'
    }))
  ];

  // Updated edges to connect the adjusted nodes
  const edges = [
    { id: 'e1-2', source: 'graph-0', target: 'linked-list-0', type: 'smoothstep', animated: true },
    { id: 'e2-3', source: 'linked-list-0', target: 'tree-0', type: 'smoothstep', animated: true }
  ];

  return (
    <div className="home-container">
      <h1>Data Structures & Algorithms Pathway</h1>

      <div style={{ height: '800px', width: '100%' }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
      </div>
    </div>
  );
}

export default HomePage;
