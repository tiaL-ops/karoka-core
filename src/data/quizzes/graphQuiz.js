const graphQuiz = {
  "dfs-bfs": [
    {
      question: "What is the time complexity of DFS?",
      options: ["O(V + E)", "O(V^2)", "O(E log V)", "O(log V)"],
      answer: "O(V + E)"
    },
    {
      question: "Which algorithm finds the shortest path in an unweighted graph?",
      options: ["DFS", "BFS", "Dijkstra's", "Kruskal's"],
      answer: "BFS"
    },
    {
      question: "Which data structure does DFS use?",
      options: ["Queue", "Stack", "Array", "Heap"],
      answer: "Stack"
    },
    {
      question: "Which algorithm is better for finding all connected components in a graph?",
      options: ["DFS", "BFS", "Prim's", "Bellman-Ford"],
      answer: "DFS"
    },
    {
      question: "In a BFS traversal, nodes are visited in which order?",
      options: ["Depth-first order", "Level order", "Random order", "Topological order"],
      answer: "Level order"
    },
    {
      question: "What is the main difference between DFS and BFS?",
      options: [
        "DFS uses a queue and BFS uses a stack",
        "DFS explores deeper nodes first, BFS explores neighbors first",
        "BFS is recursive, DFS is not",
        "DFS finds shortest paths, BFS doesn't"
      ],
      answer: "DFS explores deeper nodes first, BFS explores neighbors first"
    },
    {
      question: "What is the time complexity of BFS?",
      options: ["O(V + E)", "O(V^2)", "O(log V)", "O(V)"],
      answer: "O(V + E)"
    },
    {
      question: "Which data structure is commonly used in BFS?",
      options: ["Stack", "Queue", "Priority Queue", "Binary Search Tree"],
      answer: "Queue"
    },
    {
      question: "Which traversal method is typically used for topological sorting?",
      options: ["DFS", "BFS", "Dijkstra's", "Floyd-Warshall"],
      answer: "DFS"
    },
    {
      question: "What is a common use case for BFS?",
      options: [
        "Finding shortest paths in unweighted graphs",
        "Detecting cycles in a graph",
        "Finding strongly connected components",
        "Finding the minimum spanning tree"
      ],
      answer: "Finding shortest paths in unweighted graphs"
    }
  ]
};

export default graphQuiz;
