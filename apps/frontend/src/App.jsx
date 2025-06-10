
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserProfile from "./pages/UserProfile.jsx"; //
import PingPage from "./pages/ping.jsx"; //
import SignupPage from "@/pages/signupPage.jsx";
import Homepage from "./pages/homepage"; //
import LoginPage from "./pages/loginPage"; 
import DatabasePage from "./pages/databasePage";
import TableDataPage from "./pages/tableDataPage";
import RestrictedPage from "./pages/restrictedPage";
import CareerPage from "./pages/careersPage";
import { AuthProvider, useAuth } from "@/components/Auth/AuthContext"; //

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
    return <Navigate to="/restrictedPage" replace />;
  }

  return children; // children are the protected components
}

function App() {
  return (
    <Router>
      <AuthProvider> 
        <Routes>
          <Route path="/" element={<Homepage />} /> {/* */}
          <Route path="/userProfile" element={<UserProfile />} /> {/* */}
          <Route path="/ping" element={<PingPage />} /> {/* */}
           <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restrictedPage" element={<RestrictedPage />} />
           <Route path="/careerPage" element={<CareerPage />} />
          
          {/* Protected Game Page Route */}
          <Route 
            path="/game" 
            element={
              <PrivateRoute allowedRoles={['tester', 'admin', 'employee']}> {/* Define allowed roles here */}
                <GamePage />
              </PrivateRoute>
            } 
          />
           <Route
            path="/database"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DatabasePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/database/:tableName"
            element={
              <PrivateRoute allowedRoles={['user', 'admin']}>
                <TableDataPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;