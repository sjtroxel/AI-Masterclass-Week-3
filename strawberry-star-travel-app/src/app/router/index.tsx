import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";
import Home from "../../features/home/Home";
import StarsList from "../../features/stars/StarsList";
import Dashboard from "../../features/dashboard/Dashboard";
import Profile from "../../features/profile/Profile";
import Favorites from "../../features/favorites/Favorites";
import GalacticMap from "../../features/galactic-map/GalacticMap";
import Login from "../../auth/Login";
import Signup from "../../auth/Signup";

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <div>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Login & Signup */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Browse Stars */}
          <Route
            path="/browse-stars"
            element={
              <ProtectedRoute>
                <main>
                  <StarsList />
                </main>
              </ProtectedRoute>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Favorites */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          {/* Galactic Map */}
          <Route
            path="/galactic-map"
            element={
              <ProtectedRoute>
                <GalacticMap />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </>
  );
}
