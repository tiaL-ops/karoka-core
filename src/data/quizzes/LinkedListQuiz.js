const linkedListQuiz = {
  "linked-list": [
    {
      question: "What is the time complexity to insert an element at the head of a singly linked list?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(1)"
    },
    {
      question: "Which of the following is true about a doubly linked list?",
      options: [
        "It allows traversal in only one direction",
        "It allows traversal in both directions",
        "It requires less space than a singly linked list",
        "None of the above"
      ],
      answer: "It allows traversal in both directions"
    },
    {
      question: "What is the time complexity to access an element at the nth position in a singly linked list?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "What is the key advantage of using a linked list over an array?",
      options: [
        "Faster access to elements",
        "Dynamic memory allocation",
        "Fixed memory allocation",
        "None of the above"
      ],
      answer: "Dynamic memory allocation"
    },
    {
      question: "What is the worst-case time complexity for deleting the tail node in a singly linked list?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      answer: "O(n)"
    },
    {
      question: "Which of the following operations can be performed in constant time in a doubly linked list?",
      options: [
        "Inserting at the head",
        "Inserting at the tail",
        "Deleting the head node",
        "All of the above"
      ],
      answer: "All of the above"
    },
    {
      question: "Which of the following linked lists allows for efficient insertion and deletion at both ends?",
      options: ["Singly linked list", "Doubly linked list", "Circular linked list", "Doubly circular linked list"],
      answer: "Doubly circular linked list"
    },
    {
      question: "What does the next pointer of the last node point to in a circular singly linked list?",
      options: [
        "The first node",
        "The previous node",
        "The second-to-last node",
        "Null"
      ],
      answer: "The first node"
    },
    {
      question: "In a singly linked list, what happens if the head pointer is lost?",
      options: [
        "The list can still be accessed from any node",
        "The list becomes inaccessible",
        "You can traverse the list in reverse to recover the head",
        "None of the above"
      ],
      answer: "The list becomes inaccessible"
    },
    {
      question: "Which of the following data structures is commonly used to implement a linked list?",
      options: ["Nodes", "Arrays", "Stacks", "Queues"],
      answer: "Nodes"
    }
  ]
};

export default linkedListQuiz;
