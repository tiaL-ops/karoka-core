import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GraphPage.css';

function GraphPage() {
  const svgRef = useRef();
  const [sortedNodes, setSortedNodes] = useState([]);  // Store the result of topological sort
  const [step, setStep] = useState(0);  // Current step of the topological sort

  // Define dimensions as a percentage of the container's width for responsiveness
  const width = 550;  // Original width of SVG
  const height = 300;  // Original height of SVG

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)  // Use viewBox to make the SVG responsive
      .attr('preserveAspectRatio', 'xMidYMid meet')  // Preserve aspect ratio for scaling
      .style('background', '#f9f9f9');  // Light background for visibility

    // Define a DAG (Directed Acyclic Graph) with nodes and directed edges
    const nodes = [
      { id: 0, x: 100, y: 100 },
      { id: 1, x: 200, y: 100 },
      { id: 2, x: 300, y: 100 },
      { id: 3, x: 200, y: 200 },
      { id: 4, x: 400, y: 100 },
      { id: 5, x: 300, y: 200 },
      { id: 6, x: 500, y: 200 },
    ];

    const edges = [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 },
      { source: 3, target: 5 },
      { source: 4, target: 6 },
      { source: 5, target: 6 },
    ];

    // Draw the edges (arrows for directed edges)
    svg.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('x1', d => nodes[d.source].x)
      .attr('y1', d => nodes[d.source].y)
      .attr('x2', d => nodes[d.target].x)
      .attr('y2', d => nodes[d.target].y)
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');  // Add arrows at the end of edges

    // Add arrow markers for directed edges
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Draw the nodes
    svg.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 15)  // Node radius
      .attr('fill', '#007bff');

    svg.selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text(d => d.id);

    // Compute topological sort
    const topoOrder = kahnsTopologicalSort(nodes.length, edges);
    setSortedNodes(topoOrder);
  }, []);

  // Kahn's Algorithm for topological sorting
  function kahnsTopologicalSort(n, edges) {
    const inDegree = new Array(n).fill(0);
    const adjList = new Array(n).fill(null).map(() => []);

    // Build adjacency list and in-degree count
    edges.forEach(({ source, target }) => {
      adjList[source].push(target);
      inDegree[target]++;
    });

    // Initialize the queue with nodes that have 0 in-degree
    const queue = [];
    for (let i = 0; i < n; i++) {
      if (inDegree[i] === 0) queue.push(i);
    }

    const topoOrder = [];
    while (queue.length > 0) {
      const node = queue.shift();
      topoOrder.push(node);

      // Decrease the in-degree of its neighbors
      adjList[node].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }

    return topoOrder;
  }

  // Handle the "Next Step" button for showing the topological sort
  const handleNextStep = () => {
    if (step < sortedNodes.length) {
      const currentNode = sortedNodes[step];
      const svg = d3.select(svgRef.current);
      svg.selectAll('circle')
        .filter(d => d.id === currentNode)
        .transition()
        .duration(500)
        .attr('fill', '#28a745');  // Change color to green to indicate sorted
      setStep(step + 1);
    }
  };

  return (
    <div className="graph-container">
      <h1>Topological Sort Visualization</h1>
      <button onClick={handleNextStep} disabled={step >= sortedNodes.length}>
        Next Step
      </button>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default GraphPage;
