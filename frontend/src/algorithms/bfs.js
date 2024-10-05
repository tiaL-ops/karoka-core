// bfs.js

export function bfsMazeTraversal(maze, startX, startY) {
    const queue = [{ x: startX, y: startY }];
    const directions = [
      { dx: 1, dy: 0 },  // Right
      { dx: -1, dy: 0 },  // Left
      { dx: 0, dy: 1 },  // Down
      { dx: 0, dy: -1 }  // Up
    ];
  
    const path = [];
    const visitedSet = new Set();
    visitedSet.add(`${startX},${startY}`);
  
    while (queue.length > 0) {
      const { x, y } = queue.shift();
      path.push({ x, y, backtrack: false });
  
      for (let dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
  
        // Check if next cell is a valid passage and not visited
        if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && maze[ny][nx] === 0 && !visitedSet.has(`${nx},${ny}`)) {
          visitedSet.add(`${nx},${ny}`);
          queue.push({ x: nx, y: ny });
        }
      }
    }
  
    return path;
  }
  