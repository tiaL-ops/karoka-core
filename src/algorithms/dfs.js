// dfs.js

export function dfsMazeTraversal(maze, startX, startY) {
    const stack = [{ x: startX, y: startY }];
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
        path.push({ x, y, backtrack: false });
  
        let hasUnvisitedNeighbors = false;
  
        for (let dir of directions) {
          const nx = x + dir.dx;
          const ny = y + dir.dy;
  
          // Check if next cell is a valid passage and not visited
          if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && maze[ny][nx] === 0 && !visitedSet.has(`${nx},${ny}`)) {
            stack.push({ x: nx, y: ny });
            hasUnvisitedNeighbors = true;
          }
        }
  
        // If no unvisited neighbors, mark this as a backtracking step
        if (!hasUnvisitedNeighbors) {
          path.push({ x, y, backtrack: true });
        }
      }
    }
  
    return path;
  }
  