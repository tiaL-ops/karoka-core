class Node {
    constructor(value) {
      this.value = value;
      this.next = null;
    }
  }
  
  class LinkedList {
    constructor() {
      this.head = null;
      this.steps = [];
    }
  
    insert(value) {
      const newNode = new Node(value);
      if (!this.head) {
        this.head = newNode;
      } else {
        let current = this.head;
        while (current.next) {
          current = current.next;
        }
        current.next = newNode;
      }
      // Add the step to the steps list
      this.addStep(`Inserted node with value ${value}`);
    }
  
    delete(value) {
      if (!this.head) return;
  
      if (this.head.value === value) {
        this.head = this.head.next;
        this.addStep(`Deleted node with value ${value}`);
        return;
      }
  
      let current = this.head;
      while (current.next && current.next.value !== value) {
        current = current.next;
      }
  
      if (current.next) {
        current.next = current.next.next;
        this.addStep(`Deleted node with value ${value}`);
      }
    }
  
    traverse() {
      let current = this.head;
      while (current) {
        this.addStep(`Visited node with value ${current.value}`);
        current = current.next;
      }
    }
  
    addStep(description) {
      this.steps.push({ list: this.cloneList(), description });
    }
  
    getSteps() {
      return this.steps;
    }
  
    cloneList() {
      if (!this.head) return null;
  
      const clonedList = new LinkedList();
      let current = this.head;
      let clonedCurrent = null;
  
      // Clone the head node
      clonedList.head = new Node(current.value);
      clonedCurrent = clonedList.head;
      current = current.next;
  
      // Clone the remaining nodes
      while (current) {
        const newNode = new Node(current.value);
        clonedCurrent.next = newNode;
        clonedCurrent = newNode;
        current = current.next;
      }
  
      return clonedList.head;
    }
  }
  
  export default LinkedList;
  