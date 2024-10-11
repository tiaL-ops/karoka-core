import React, { useState, useEffect } from "react";
import './BinaryTreePage.css';  // Include your CSS here for the visualization

// Helper functions for heapification
const parent = (index) => Math.floor((index - 1) / 2);
const leftChild = (index) => 2 * index + 1;
const rightChild = (index) => 2 * index + 2;

// Min-Heap Insert: Bubble up
const bubbleUp = (heap, index) => {
  let currentIndex = index;
  while (
    currentIndex > 0 &&
    heap[currentIndex] < heap[parent(currentIndex)]
  ) {
    [heap[currentIndex], heap[parent(currentIndex)]] = [
      heap[parent(currentIndex)],
      heap[currentIndex],
    ];
    currentIndex = parent(currentIndex);
  }
  return [...heap];
};

// Min-Heap Remove: Bubble down
const bubbleDown = (heap, index) => {
  let currentIndex = index;
  const length = heap.length;
  while (true) {
    const left = leftChild(currentIndex);
    const right = rightChild(currentIndex);
    let smallest = currentIndex;

    if (left < length && heap[left] < heap[smallest]) {
      smallest = left;
    }
    if (right < length && heap[right] < heap[smallest]) {
      smallest = right;
    }
    if (smallest !== currentIndex) {
      [heap[currentIndex], heap[smallest]] = [heap[smallest], heap[currentIndex]];
      currentIndex = smallest;
    } else {
      break;
    }
  }
  return [...heap];
};

const BinaryHeap = () => {
  const [heap, setHeap] = useState([]);
  const [newElement, setNewElement] = useState("");
  const [animationSteps, setAnimationSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Insertion with animation
  const handleInsert = () => {
    if (!newElement) return;
    const newHeap = [...heap, parseInt(newElement)];
    const updatedHeap = bubbleUp(newHeap, newHeap.length - 1);
    setAnimationSteps([...animationSteps, { type: "insert", heap: updatedHeap }]);
    setHeap(updatedHeap);
    setNewElement("");
  };

  // Deletion (removing the root)
  const handleRemove = () => {
    if (heap.length === 0) return;
    const newHeap = [...heap];
    // Swap root with the last element
    newHeap[0] = newHeap.pop();
    const updatedHeap = bubbleDown(newHeap, 0);
    setAnimationSteps([...animationSteps, { type: "remove", heap: updatedHeap }]);
    setHeap(updatedHeap);
  };

  // Heap visualization as a binary tree
  const renderHeap = (heap, index = 0) => {
    if (index >= heap.length) return null;
    return (
      <div className="heap-node-container">
        <div className="heap-node">
          {heap[index]}
        </div>
        <div className="heap-children">
          {renderHeap(heap, leftChild(index))}
          {renderHeap(heap, rightChild(index))}
        </div>
      </div>
    );
  };

  // Handle animation step by step
  useEffect(() => {
    if (animationSteps.length && !isAnimating) {
      setIsAnimating(true);
      const [nextStep, ...remainingSteps] = animationSteps;
      setTimeout(() => {
        setHeap(nextStep.heap);
        setAnimationSteps(remainingSteps);
        setIsAnimating(false);
      }, 500);
    }
  }, [animationSteps, isAnimating]);

  return (
    <div className="binary-heap-container">
      <h2>Binary Min-Heap Visualization</h2>
      <div className="controls">
        <input
          type="number"
          value={newElement}
          onChange={(e) => setNewElement(e.target.value)}
          placeholder="Insert Element"
        />
        <button onClick={handleInsert} disabled={isAnimating}>
          Insert
        </button>
        <button onClick={handleRemove} disabled={heap.length === 0 || isAnimating}>
          Remove Root
        </button>
      </div>
      <div className="heap-visualization">
        {renderHeap(heap)}
      </div>
    </div>
  );
};

export default BinaryHeap;
