import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './MergeSortPage.css';

function MergeSortPage() {
  const svgRef = useRef();
  const [array, setArray] = useState([38, 27, 43, 3, 9, 82, 10]);  // Initial array
  const [step, setStep] = useState(0);  // Current step of the merge sort process
  const [mergeSteps, setMergeSteps] = useState([]);  // Store the merge steps
  const width = 550;
  const height = 300;

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background', '#f9f9f9');

    // Initial drawing of array
    drawArray(array);

    // Calculate merge sort steps
    const steps = getMergeSortSteps(array);
    setMergeSteps(steps);
  }, [array]);

  // Function to visualize the array as a set of rectangles
  const drawArray = (arr) => {
    const svg = d3.select(svgRef.current);
    const barWidth = 50;
    const barHeightScale = 5;  // Scale bar heights
    const barPadding = 10;

    svg.selectAll('*').remove();  // Clear previous render

    svg.selectAll('rect')
      .data(arr)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * (barWidth + barPadding))
      .attr('y', d => height - d * barHeightScale)
      .attr('width', barWidth)
      .attr('height', d => d * barHeightScale)
      .attr('fill', '#007bff');

    svg.selectAll('text')
      .data(arr)
      .enter()
      .append('text')
      .attr('x', (d, i) => i * (barWidth + barPadding) + barWidth / 2)
      .attr('y', d => height - d * barHeightScale - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .text(d => d);
  };

  // Function to perform merge sort and track the steps
  const getMergeSortSteps = (arr) => {
    let steps = [];
    
    const mergeSort = (arr, start = 0, end = arr.length) => {
      if (end - start <= 1) return arr.slice(start, end);
      
      const mid = Math.floor((start + end) / 2);
      const left = mergeSort(arr, start, mid);
      const right = mergeSort(arr, mid, end);
      
      const merged = [];
      let i = 0, j = 0;
      
      while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
          merged.push(left[i++]);
        } else {
          merged.push(right[j++]);
        }
      }
      
      // Add any remaining elements from left or right
      while (i < left.length) merged.push(left[i++]);
      while (j < right.length) merged.push(right[j++]);
      
      // Replace the original array values with the merged result
      for (let k = start; k < end; k++) {
        arr[k] = merged[k - start];
      }
      
      // Store the current array state for animation
      steps.push([...arr]);
      return arr;
    };
    
    mergeSort([...arr]);
    return steps;
  };

  // Handle the "Next Step" button to show each step of the merge process
  const handleNextStep = () => {
    if (step < mergeSteps.length) {
      drawArray(mergeSteps[step]);
      setStep(step + 1);
    }
  };

  return (
    <div className="merge-sort-container">
      <h1>Merge Sort Visualization</h1>
      <button onClick={handleNextStep} disabled={step >= mergeSteps.length}>
        Next Step
      </button>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default MergeSortPage;
