import React, { useEffect, useRef, useState, useCallback } from 'react';
import './2DMatrix.css';
import * as d3 from 'd3';
import { dfsMazeTraversal } from '../../algorithms/dfs'; // Correct relative path for dfs
import { bfsMazeTraversal } from '../../algorithms/bfs'; // Correct relative path for bfs

function primsMaze(width, height) {
  const maze = Array(height).fill(null).map(() => Array(width).fill(1));  // Initialize grid full of walls (1)
  
  const startX = Math.floor(Math.random() * width);
  const startY = Math.floor(Math.random() * height);
  
  const directions = [
    { dx: 2, dy: 0 },  // Right
    { dx: -2, dy: 0 },  // Left
    { dx: 0, dy: 2 },  // Down
    { dx: 0, dy: -2 }  // Up
  ];

  // Mark the starting cell as a passage
  maze[startY][startX] = 0;

  // List of walls
  let walls = [];

  // Add the walls of the initial cell to the wall list
  directions.forEach(dir => {
    const nx = startX + dir.dx;
    const ny = startY + dir.dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      walls.push({ x: nx, y: ny, px: startX, py: startY });
    }
  });

  // Process walls
  while (walls.length > 0) {
    const randomIndex = Math.floor(Math.random() * walls.length);
    const wall = walls.splice(randomIndex, 1)[0];

    const { x, y, px, py } = wall;
    
    // Check if the cell opposite the wall is a passage
    if (maze[y][x] === 1) {
      // Make the wall a passage
      maze[y][x] = 0;
      // Make the cell in between the wall and the passage also a passage
      maze[(y + py) / 2][(x + px) / 2] = 0;

      // Add neighboring walls of the new passage to the list
      directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 1) {
          walls.push({ x: nx, y: ny, px: x, py: y });
        }
      });
    }
  }

  return maze;
}

function MatrixPage() {
  const [maze, setMaze] = useState([]);
  const [path, setPath] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);  // Index for DFS/BFS step
  const [algorithm, setAlgorithm] = useState('dfs');  // Track the chosen algorithm
  const svgRef = useRef();
  const width = 21;  // Maze width
  const height = 15;  // Maze height

  // Dynamically adjust cell size based on screen width
  const getCellSize = () => {
    if (window.innerWidth <= 600) {
      return 15; // Smaller cell size for mobile devices
    }
    return 30;  // Default larger cell size for desktop
  };
  
  const [cellSize, setCellSize] = useState(getCellSize());

  // Recalculate the cell size on window resize
  useEffect(() => {
    const handleResize = () => {
      setCellSize(getCellSize());
    };

    window.addEventListener('resize', handleResize);  // Listen for window resize
    return () => window.removeEventListener('resize', handleResize);  // Cleanup on unmount
  }, []);

  // Using useCallback to memoize the generateNewMaze function and avoid infinite loops
  const generateNewMaze = useCallback(() => {
    const newMaze = primsMaze(width, height);  // Generate the maze using Prim's algorithm
    setMaze(newMaze);
    setStepIndex(0);  // Reset DFS/BFS step

    if (algorithm === 'dfs') {
      const dfsTraversalPath = dfsMazeTraversal(newMaze, 1, 1);  // Generate DFS path
      setPath(dfsTraversalPath);
    } else {
      const bfsTraversalPath = bfsMazeTraversal(newMaze, 1, 1);  // Generate BFS path
      setPath(bfsTraversalPath);
    }
  }, [algorithm]);  // Depend on 'algorithm' to regenerate maze when it changes

  // Generate a new maze when the component first mounts or when the algorithm changes
  useEffect(() => {
    generateNewMaze();  // Generate initial maze and DFS/BFS path
  }, [generateNewMaze]);

  const handleNextStep = () => {
    // Move to the next step in the DFS/BFS if possible
    if (stepIndex < path.length - 1) {
      setStepIndex(stepIndex + 1);  // Increment to the next step
    }
  };

  const handleAlgorithmChange = (algo) => {
    setAlgorithm(algo);  // Set the chosen algorithm (DFS or BFS)
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', width * cellSize)
      .attr('height', height * cellSize);

    // Render the maze
    svg.selectAll('rect')
      .data(maze.flat())
      .join('rect')
      .attr('x', (d, i) => (i % width) * cellSize + 2)  // Offset by 2 for better positioning
      .attr('y', (d, i) => Math.floor(i / width) * cellSize + 2)
      .attr('width', cellSize - 4)
      .attr('height', cellSize - 4)
      .attr('rx', 6)  // Rounded corners
      .attr('ry', 6)
      .attr('fill', d => (d === 1 ? '#2E3A59' : '#F7F7F7'))
      .attr('stroke', '#FFF')
      .attr('stroke-width', 2)
      .style('box-shadow', '2px 2px 5px rgba(0, 0, 0, 0.2)')
      .style('transition', 'all 0.3s ease-in-out');

    // Traversal path (DFS/BFS)
    svg.selectAll('.dfs-cell')
      .data(path.slice(0, stepIndex + 1), d => `${d.x}-${d.y}`)
      .join('rect')
      .attr('class', 'dfs-cell')
      .attr('x', d => d.x * cellSize + 2)
      .attr('y', d => d.y * cellSize + 2)
      .attr('width', cellSize - 4)
      .attr('height', cellSize - 4)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', d => d.backtrack ? 'rgba(255,99,71,0.8)' : 'rgba(50,205,50,0.8)')
      .attr('stroke', '#FFF')
      .attr('stroke-width', 2)
      .style('transition', 'all 0.3s ease-in-out');

    // Highlight current node
    if (path[stepIndex]) {
      svg.selectAll('.current')
        .data([path[stepIndex]])
        .join('rect')
        .attr('class', 'current')
        .attr('x', d => d.x * cellSize + 2)
        .attr('y', d => d.y * cellSize + 2)
        .attr('width', cellSize - 4)
        .attr('height', cellSize - 4)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', 'rgba(30,144,255,0.8)')
        .attr('stroke', '#FFF')
        .attr('stroke-width', 2)
        .style('transition', 'all 0.3s ease-in-out');
    }
  }, [stepIndex, path, maze, cellSize]);

  return (
    <div className="container">
      <h1 className="title">Maze Traversal (DFS / BFS)</h1>
      <div className="controls">
        <button className="button" onClick={generateNewMaze}>Generate New Maze</button>
        <button className="button" onClick={handleNextStep}>Next Step</button>
        <button className="button" onClick={() => handleAlgorithmChange('dfs')}>Use DFS</button>
        <button className="button" onClick={() => handleAlgorithmChange('bfs')}>Use BFS</button>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default MatrixPage;
