import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './components/UserContext'; // Adjust the path as necessary

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import ProductPage from "./components/ProductPage";

function App() {
    return (
        <Router>
            <UserProvider> {/* Wrap all routes in the UserProvider */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/products/:season" element={<ProductPage />} />
                    <Route path="*" element={<Login />} /> {/* Fallback route to Login */}
                </Routes>
            </UserProvider>
        </Router>
    );
}

export default App;
