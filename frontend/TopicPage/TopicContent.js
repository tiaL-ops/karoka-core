import React from 'react';
import graphTopics from '../../data/topics/graphTopics';         // Import Graph-related topics data
import linkedListTopics from '../../data/topics/linkedListTopics';  // Import Linked List-related topics data
import treeTopics from '../../data/topics/treeTopics';           // Import Tree-related topics data

function TopicContent({ topic }) {
  // Combine all topics into a single array
  const allTopics = [...graphTopics, ...linkedListTopics, ...treeTopics];

  // Find the current topic by its id
  const currentTopic = allTopics.find(t => t.id === topic);

  // If no topic found, return a default message
  if (!currentTopic) {
    return <div>Topic not found</div>;
  }

  return (
    <div className="topic-content">
      <h2>{currentTopic.name}</h2>
      <p>{currentTopic.description}</p>
      {currentTopic.details && <p>{currentTopic.details}</p>}
    </div>
  );
}

export default TopicContent;
