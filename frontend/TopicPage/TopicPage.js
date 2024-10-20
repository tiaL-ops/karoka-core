import React from 'react';
import { useParams } from 'react-router-dom';
import TopicContent from './TopicContent';
import QuizPage from './QuizPage';

function TopicPage() {
  const { topic, section } = useParams();  // Get the topic (e.g., dfs-bfs) and section (learn/quiz)

  return (
    <div>
      {section === 'learn' ? (
        <TopicContent topic={topic} />
      ) : (
        <QuizPage topic={topic} />
      )}
    </div>
  );
}

export default TopicPage;
