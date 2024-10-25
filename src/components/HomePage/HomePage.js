import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="home-container">
      <h1>Data Structures & Algorithms Pathway</h1>
      <div className="card-container">
        <div className="card">
          <h3>DFS and BFS</h3>
          <div className="button-container">
            <button className="learn-btn" onClick={() => handleLearnSelect('dfs-bfs')}>Learn</button>
            <button className="quiz-btn" onClick={() => handleQuizSelect('dfs-bfs')}>Quiz</button>
          </div>
        </div>

        <div className="card">
          <h3>Linked List</h3>
          <div className="button-container">
            <button className="learn-btn" onClick={() => handleLearnSelect('linked-list')}>Learn</button>
            <button className="quiz-btn" onClick={() => handleQuizSelect('linked-list')}>Quiz</button>
          </div>
        </div>

        <div className="card">
          <h3>Binary Tree</h3>
          <div className="button-container">
            <button className="learn-btn" onClick={() => handleLearnSelect('binary-tree')}>Learn</button>
            <button className="quiz-btn" onClick={() => handleQuizSelect('binary-tree')}>Quiz</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
