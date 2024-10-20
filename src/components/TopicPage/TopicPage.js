import React from 'react';
import { useParams } from 'react-router-dom';
import MatrixPage from '../2DMatrix/2DMatrix';  // Import your DFS/BFS visualizer
import QuizPage from './QuizPage';  // Import Quiz Page

function TopicPage() {
  const { topic, section } = useParams();  // Extract 'topic' and 'section' from the URL

  return (
    <div>
      {section === 'learn' ? (
        <MatrixPage />  // Direct to DFS/BFS visualizer
      ) : (
        <QuizPage topic={topic} />  // Show quiz page for selected topic
      )}
    </div>
  );
}

export default TopicPage;
