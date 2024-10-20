import React from 'react';
import graphTopics from '../../data/topics/graphTopics';  // Import graph topics data

function TopicContent({ topic }) {
  const currentTopic = graphTopics.find(t => t.id === topic);  // Get topic by id (e.g., dfs-bfs)

  return (
    <div className="topic-content">
      <h2>{currentTopic.name}</h2>
      <p>{currentTopic.description}</p>
      <p>{currentTopic.details}</p>
    </div>
  );
}

export default TopicContent;
