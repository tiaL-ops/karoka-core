import React, { useEffect, useRef } from 'react';
import './2DMatrix.css';
import * as d3 from 'd3';

function generateMaze(width, height) {
  const maze = Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));

  // Recursive Division Maze Generation Algorithm
  function divide(x, y, w, h, orientation) {
    if (w < 2 || h < 2) return;

    const isHorizontal = orientation === 'horizontal';
    const wx = x + (isHorizontal ? 0 : Math.floor(Math.random() * (w - 1)));
    const wy = y + (isHorizontal ? Math.floor(Math.random() * (h - 1)) : 0);
    const px = wx + (isHorizontal ? Math.floor(Math.random() * w) : 0);
    const py = wy + (isHorizontal ? 0 : Math.floor(Math.random() * h));

    const dx = isHorizontal ? 1 : 0;
    const dy = isHorizontal ? 0 : 1;

    const length = isHorizontal ? w : h;
    const dir = isHorizontal ? 'horizontal' : 'vertical';

    for (let i = 0; i < length; i++) {
      if (wx + dx * i !== px || wy + dy * i !== py) {
        maze[wy + dy * i][wx + dx * i] = 1; // 1 means wall
      }
    }

    const [nx, ny] = [x, y];
    const [nw, nh] = isHorizontal ? [w, wy - y + 1] : [wx - x + 1, h];
    const [nx2, ny2] = isHorizontal ? [x, wy + 1] : [wx + 1, y];
    const [nw2, nh2] = isHorizontal ? [w, y + h - wy - 1] : [x + w - wx - 1, h];

    divide(nx, ny, nw, nh, chooseOrientation(nw, nh));
    divide(nx2, ny2, nw2, nh2, chooseOrientation(nw2, nh2));
  }

  function chooseOrientation(w, h) {
    if (w < h) return 'horizontal';
    if (h < w) return 'vertical';
    return Math.random() > 0.5 ? 'horizontal' : 'vertical';
  }

  divide(0, 0, width, height, chooseOrientation(width, height));
  return maze;
}

function MatrixPage() {
  const svgRef = useRef();

  useEffect(() => {
    const width = 30;
    const height = 20;
    const cellSize = 20;

    const svg = d3.select(svgRef.current)
      .attr('width', width * cellSize)
      .attr('height', height * cellSize);

    const maze = generateMaze(width, height);

    svg.selectAll('rect')
      .data(maze.flat())
      .enter()
      .append('rect')
      .attr('x', (d, i) => (i % width) * cellSize)
      .attr('y', (d, i) => Math.floor(i / width) * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => (d === 1 ? '#000' : '#fff'))
      .attr('stroke', '#ccc');
  }, []);

  return (
    <div>
      <h1>Maze Generation</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default MatrixPage;
