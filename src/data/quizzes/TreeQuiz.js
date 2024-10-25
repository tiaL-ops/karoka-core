const treeQuiz = {
  "binary-tree": [
    {
      question: "What is the height of a balanced binary tree?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
      answer: "O(log n)"
    },
    {
      question: "What traversal method visits the left subtree first?",
      options: ["Pre-order", "In-order", "Post-order", "Level-order"],
      answer: "In-order"
    },
    {
      question: "What is the time complexity of inserting an element in a binary search tree (BST) on average?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
      answer: "O(log n)"
    },
    {
      question: "Which of the following traversal methods is not depth-first?",
      options: ["Pre-order", "Post-order", "In-order", "Level-order"],
      answer: "Level-order"
    },
    {
      question: "Which of the following is true about a full binary tree?",
      options: [
        "Every node has either 0 or 2 children",
        "All leaf nodes are at the same level",
        "It has the maximum number of nodes",
        "All nodes have the same value"
      ],
      answer: "Every node has either 0 or 2 children"
    },
    {
      question: "What is the time complexity for searching for an element in an unbalanced binary search tree (BST)?",
      options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "What type of binary tree has all leaf nodes at the same level and every internal node has exactly two children?",
      options: [
        "Full binary tree",
        "Complete binary tree",
        "Perfect binary tree",
        "AVL tree"
      ],
      answer: "Perfect binary tree"
    },
    {
      question: "Which traversal technique is used to get the nodes of a BST in non-decreasing order?",
      options: ["Pre-order", "In-order", "Post-order", "Level-order"],
      answer: "In-order"
    },
    {
      question: "What is the maximum number of nodes in a binary tree of height h?",
      options: [
        "2^h",
        "2^(h+1) - 1",
        "h^2",
        "h!"
      ],
      answer: "2^(h+1) - 1"
    },
    {
      question: "What is the minimum height of a binary tree with n nodes?",
      options: [
        "log(n + 1)",
        "n",
        "log(n)",
        "n/2"
      ],
      answer: "log(n + 1)"
    }
  ]
};

export default treeQuiz;
