import React, { useEffect, useRef, useState } from 'react';
import './2DMatrix.css';
import * as d3 from 'd3';

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

function dfsMazeTraversal(maze, startX, startY) {
  const stack = [{ x: startX, y: startY }];
  const visited = [];
  const directions = [
    { dx: 1, dy: 0 },  // Right
    { dx: -1, dy: 0 },  // Left
    { dx: 0, dy: 1 },  // Down
    { dx: 0, dy: -1 }  // Up
  ];

  const path = [];
  const visitedSet = new Set();

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const key = `${x},${y}`;

    if (!visitedSet.has(key)) {
      visitedSet.add(key);
      visited.push({ x, y });
      path.push({ x, y, backtrack: false });

      for (let dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;

        // Check if next cell is a valid passage and not visited
        if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && maze[ny][nx] === 0 && !visitedSet.has(`${nx},${ny}`)) {
          stack.push({ x: nx, y: ny });
        }
      }

      // If stack becomes empty, we know we are backtracking
      if (stack.length > 0 && `${stack[stack.length - 1].x},${stack[stack.length - 1].y}` !== key) {
        path.push({ x, y, backtrack: true });
      }
    }
  }

  return path;
}

function MatrixPage() {
  const [maze, setMaze] = useState([]);
  const [dfsPath, setDfsPath] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);  // Index for DFS step
  const svgRef = useRef();
  const width = 21;  // Maze width
  const height = 15;  // Maze height
  const cellSize = 20;  // Set the size of each cell

  const generateNewMaze = () => {
    const newMaze = primsMaze(width, height);  // Generate the maze using Prim's algorithm
    const dfsTraversalPath = dfsMazeTraversal(newMaze, 1, 1);  // Generate DFS path
    setMaze(newMaze);
    setDfsPath(dfsTraversalPath);
    setStepIndex(0);  // Reset DFS step
  };

  useEffect(() => {
    generateNewMaze();  // Generate initial maze and DFS path
  }, []);

  const handleNextStep = () => {
    if (stepIndex < dfsPath.length - 1) {
      setStepIndex(stepIndex + 1);  // Go to the next step in the DFS
    }
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', width * cellSize)
      .attr('height', height * cellSize);

    // Render the maze (only once)
    svg.selectAll('rect')
      .data(maze.flat())
      .join('rect')
      .attr('x', (d, i) => (i % width) * cellSize)
      .attr('y', (d, i) => Math.floor(i / width) * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => (d === 1 ? '#000' : '#fff'))
      .attr('stroke', '#ccc');

    // Render the DFS traversal step by step using data binding
    svg.selectAll('.dfs-cell')
      .data(dfsPath.slice(0, stepIndex + 1), d => `${d.x}-${d.y}`)  // Bind data only for the current DFS step
      .join('rect')
      .attr('class', 'dfs-cell')
      .attr('x', d => d.x * cellSize)
      .attr('y', d => d.y * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => d.backtrack ? '#ff6347' : '#00ff00')  // Red for backtracking, green for normal traversal
      .attr('stroke', '#ccc');

    // Highlight the current node in blue
    if (dfsPath[stepIndex]) {
      svg.selectAll('.current')
        .data([dfsPath[stepIndex]])
        .join('rect')
        .attr('class', 'current')
        .attr('x', d => d.x * cellSize)
        .attr('y', d => d.y * cellSize)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('fill', '#0000ff')  // Blue for the current node
        .attr('stroke', '#ccc');
    }
  }, [stepIndex, dfsPath, maze]);  // Re-render only when the DFS step or maze changes

  return (
    <div>
      <h1>DFS Maze Traversal - Step by Step</h1>
      <button onClick={generateNewMaze}>Generate New Maze</button>
      <button onClick={handleNextStep}>Next Step</button>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default MatrixPage;
