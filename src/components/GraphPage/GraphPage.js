import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './GraphPage.css';  // Import your styles

function GraphPage() {
  const svgRef = useRef();

  useEffect(() => {
    const width = 600;
    const height = 400;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Generate random nodes
    const nodes = d3.range(10).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height
    }));

    // Compute edges using Prim's Algorithm
    const edges = primsAlgorithm(nodes);

    // Draw edges
    svg.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    // Draw nodes
    svg.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .attr('fill', '#007bff');

  }, []);

  // Prim's Algorithm to generate a Minimum Spanning Tree
  function primsAlgorithm(nodes) {
    const edges = [];
    const visited = new Set();
    visited.add(0);  // Start with the first node

    while (visited.size < nodes.length) {
      let minEdge = null;
      for (let i of visited) {
        for (let j = 0; j < nodes.length; j++) {
          if (!visited.has(j)) {
            const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (!minEdge || distance < minEdge.distance) {
              minEdge = { source: nodes[i], target: nodes[j], distance };
            }
          }
        }
      }
      if (minEdge) {
        edges.push(minEdge);
        visited.add(nodes.indexOf(minEdge.target));
      }
    }

    return edges;
  }

  return (
    <div>
      <h1>2D Graph - Prim's Algorithm Visualization</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default GraphPage;
