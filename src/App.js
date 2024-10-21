import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import MatrixPage from './components/2DMatrix/2DMatrix';        // DFS/BFS Learn Page (Graphs)
import LinkedListPage from './components/LinkedListPage/LinkedListPage';  // Learn page for Linked List
import BinaryTreePage from './components/BinaryTreePage/BinaryTreePage'; // Learn page for Binary Trees
import TopicPage from './components/TopicPage/TopicPage';  // Handles quiz sections

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Specific Learn Pages for each topic */}
        <Route path="/learn/dfs-bfs" element={<MatrixPage />} />
        <Route path="/learn/linked-list" element={<LinkedListPage />} />
        <Route path="/learn/binary-tree" element={<BinaryTreePage />} />

        {/* Quiz Pages for each topic */}
        <Route path="/topic/:topic/quiz" element={<TopicPage />} />
      </Routes>
    </Router>
  );
}

export default App;
