import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';  // Optional if you want to style the homepage

function HomePage() {
  return (
    <div>
      <h1>Manaoahona to the Algorithm Visualizer</h1>
      <nav>
        <Link to="/graph">Go to Graph Visualization</Link> 
        <Link to="/maze">Go to Maze Generation</Link>
        <Link to="/LinkedList">Go to LinkedList</Link>
      </nav>
    </div>
  );
}

export default HomePage;
