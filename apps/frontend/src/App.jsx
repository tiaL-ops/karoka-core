// main.jsx or App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./pages/userProfile";
import PingPage from "./pages/ping";
import Homepage from "./pages/homepage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
       <Route path="/userProfile" element={<UserProfile/>} />
       <Route path="/ping" element={<PingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
