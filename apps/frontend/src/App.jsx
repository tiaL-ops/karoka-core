
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserProfile from "./pages/userProfile"; //
import PingPage from "./pages/ping"; //
import Homepage from "./pages/homepage"; //
import LoginPage from "./pages/loginPage"; 
import { AuthProvider, useAuth } from "./components/Auth/AuthManager"; //

import GamePage from "./pages/game";

// A simple PrivateRoute component
function PrivateRoute({ children, allowedRoles }) {
  const { userProfile, loading } = useAuth(); //

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  if (!userProfile) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
   // should think of access denied page here
    return <Navigate to="/" replace />;
  }

  return children; // children are the protected components
}

function App() {
  return (
    <Router>
      <AuthProvider> 
        <Routes>
          <Route path="/" element={<Homepage />} /> {/* */}
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/userProfile" element={<UserProfile />} /> {/* */}
          <Route path="/ping" element={<PingPage />} /> {/* */}
          
          {/* Protected Game Page Route */}
          <Route 
            path="/game" 
            element={
              <PrivateRoute allowedRoles={['tester', 'admin', 'employee']}> {/* Define allowed roles here */}
                <GamePage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;