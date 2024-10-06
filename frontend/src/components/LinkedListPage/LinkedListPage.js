import React, { useState } from 'react';
import LinkedList from '../../algorithms/linkedList'; // The linked list logic
import './LinkedListPage.css';
import CodeView from './CodeView'; // Import the CodeView component

function LinkedListPage() {
  const [list] = useState(new LinkedList());
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState(''); // State to hold the code snippet

  // Initialize the linked list with some nodes and set steps
  const initializeList = () => {
    list.insert(1);
    list.insert(2);
    list.insert(3);
    list.traverse();
    setSteps(list.getSteps());

    // Initial pseudocode for insertion
    setCodeSnippet(`Insert:
    1. Create a new node with the value.
    2. If the list is empty, set head to new node.
    3. Else, traverse to the last node and set its next to the new node.`);
  };

  // Call initializeList when the page loads
  React.useEffect(() => {
    initializeList();
  }, []);

  // Handle the next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateCodeSnippet(currentStep + 1);
    }
  };

  // Handle the previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateCodeSnippet(currentStep - 1);
    }
  };

  // Update the pseudocode based on the current step description
  const updateCodeSnippet = (stepIndex) => {
    const stepDescription = steps[stepIndex]?.description;

    if (stepDescription.includes('Inserted')) {
      setCodeSnippet(`Insert:
      1. Create a new node with the value.
      2. If the list is empty, set head to new node.
      3. Else, traverse to the last node and set its next to the new node.`);
    } else if (stepDescription.includes('Deleted')) {
      setCodeSnippet(`Delete:
      1. Find the node with the given value.
      2. If found, update the previous node's next to skip the deleted node.`);
    } else if (stepDescription.includes('Visited')) {
      setCodeSnippet(`Traverse:
      1. Start from the head.
      2. Visit each node and move to the next node until the end of the list.`);
    }
  };

  // Get the current state of the list at the current step
  const renderLinkedList = () => {
    const step = steps[currentStep];
    if (!step) return null;

    const nodes = [];
    let current = step.list;
    let index = 0;  // Use an index to ensure unique keys

    while (current) {
      nodes.push(
        <div className="node" key={`node-${index}`}>
          {current.value}
        </div>
      );
      if (current.next) {
        nodes.push(<div className="arrow" key={`arrow-${index}`}>&rarr;</div>);
      }
      current = current.next;
      index++;
    }

    return <div className="linked-list">{nodes}</div>;
  };

  return (
    <div className="linked-list-page">
      <h1>Linked List Visualization</h1>

      {/* Render the linked list */}
      {renderLinkedList()}

      {/* Display the pseudocode */}
      <div className="code-section">
        <h2>Code Snippet</h2>
        <CodeView codeSnippet={codeSnippet} /> {/* Use the CodeView component */}
      </div>

      {/* Display the current step description */}
      <div className="step-description">
        {steps[currentStep] ? steps[currentStep].description : ""}
      </div>

      {/* Debug controls */}
      <div className="controls">
        <button onClick={handlePrevious} disabled={currentStep === 0}>Previous Step</button>
        <button onClick={handleNext} disabled={currentStep === steps.length - 1}>Next Step</button>
      </div>
    </div>
  );
}

export default LinkedListPage;
