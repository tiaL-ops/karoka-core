import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';  // Optional if you want to style the homepage

function HomePage() {
  return (
    <div className="homepage-container">
      <h1>Tongasoa to the Algorithm Visualizer!</h1>
      <nav className="homepage-nav">
        <Link to="/graph" className="nav-link">Go to Graph Visualization</Link> 
        <Link to="/maze" className="nav-link">Go to Maze Generation</Link>
        <Link to="/LinkedList" className="nav-link">Go to LinkedList</Link>
        <Link to="/binary-tree" className="nav-link">Go to Binary Tree Visualization</Link>  {/* Added Binary Tree link */}
      </nav>
    </div>
  );
}

export default HomePage;
