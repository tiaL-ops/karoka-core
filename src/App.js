import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import TopicPage from './components/TopicPage/TopicPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:topic/:section" element={<TopicPage />} />  {/* Handles Learn/Quiz sections */}
      </Routes>
    </Router>
  );
}

export default App;
