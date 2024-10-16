import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';  // Import HomePage
import GraphPage from './components/GraphPage/GraphPage';  // Import GraphPage
import MatrixPage from './components/2DMatrix/2DMatrix';  // Import MatrixPage
import LinkedListPage from './components/LinkedListPage/LinkedListPage';  // Import LinkedListPage
import BinaryTreePage from './components/BinaryTreePage/BinaryTreePage';  // Import BinaryTreePage
import MergeSortPage from './components/SortingPage/MergeSortPage/MergeSortPage';  // Import MergeSortPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />  {/* Home Page */}
        <Route path="/graph" element={<GraphPage />} />  {/* Graph Page */}
        <Route path="/maze" element={<MatrixPage />} />  {/* Maze Page */}
        <Route path="/linkedlist" element={<LinkedListPage />} />  {/* Linked List Page */}
        <Route path="/binary-tree" element={<BinaryTreePage />} />  {/* Binary Tree Page */} 
        <Route path="/merge-sort" element={<MergeSortPage />} />  {/* Merge Sort Page */}
      </Routes>
    </Router>
  );
}

export default App;
