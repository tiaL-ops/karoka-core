import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import graphTopics from '../../data/topics/graphTopics';       // Data for Graph-related topics
import linkedListTopics from '../../data/topics/linkedListTopics'; // Data for Linked List topics
import treeTopics from '../../data/topics/treeTopics';         // Data for Tree-related topics

function HomePage() {
  const navigate = useNavigate();

  // Direct the Learn button to specific Learn page of the topic
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

  // Direct the Quiz button to the quiz section for each topic
  const handleQuizSelect = (topic) => {
    navigate(`/topic/${topic}/quiz`);
  };

  return (
    <div className="home-container">
      <h1>Welcome to Data Structures & Algorithms</h1>

      <div className="tree-structure">
        {/* Graph Topics (DFS/BFS) */}
        <h2>Graph Topics</h2>
        {graphTopics.map((topic, index) => (
          <div key={index} className="topic-node">
            <h3>{topic.name}</h3>
            <button onClick={() => handleLearnSelect(`${topic.id}`)}>Learn</button>
            <button onClick={() => handleQuizSelect(`${topic.id}`)}>Quiz</button>
          </div>
        ))}

        {/* Linked List Topics */}
        <h2>Linked List Topics</h2>
        {linkedListTopics.map((topic, index) => (
          <div key={index} className="topic-node">
            <h3>{topic.name}</h3>
            <button onClick={() => handleLearnSelect(`${topic.id}`)}>Learn</button>
            <button onClick={() => handleQuizSelect(`${topic.id}`)}>Quiz</button>
          </div>
        ))}

        {/* Tree Topics */}
        <h2>Tree Topics</h2>
        {treeTopics.map((topic, index) => (
          <div key={index} className="topic-node">
            <h3>{topic.name}</h3>
            <button onClick={() => handleLearnSelect(`${topic.id}`)}>Learn</button>
            <button onClick={() => handleQuizSelect(`${topic.id}`)}>Quiz</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
