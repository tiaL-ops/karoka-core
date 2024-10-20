import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import graphTopics from '../../data/topics/graphTopics';  // Import graph topics data

function HomePage() {
  const navigate = useNavigate();

  const handleTopicSelect = (topic, section) => {
    navigate(`/topic/${topic}/${section}`);
  };

  return (
    <div className="home-container">
      <h1>Welcome to Data Structures & Algorithms</h1>
      <div className="tree-structure">
        {graphTopics.map((topic, index) => (
          <div key={index} className="topic-node">
            <h2>{topic.name}</h2>
            <button onClick={() => handleTopicSelect(`${topic.id}`, 'learn')}>Learn</button>
            <button onClick={() => handleTopicSelect(`${topic.id}`, 'quiz')}>Quiz</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
