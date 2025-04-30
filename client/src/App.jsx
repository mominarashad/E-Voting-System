import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from './pages/SignUp/Signup'
import Login from "./pages/Login/Login";
import Votes from "./pages/Voter/Votes";
import Try from "./pages/ElectionOfficial/Admitry";
import Dashboard from "./pages/Dashboard/Dashboard";
import Admin from './pages/Admin/Admin';
import Candidates from './pages/Candidates/Candidates';
import ContactForm from "./pages/Contact/ContactForm";
import About from "./pages/About/About";
const App = () => {
  return (
    <Router>
      <div className="d-flex">
        
        <div className="content">
          <Routes>
          <Route path="/" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/vote" element={<Votes />} />
           <Route path="/official" element={<Try />} />
           <Route path="/login" element={<Login/>} />
           <Route path="/admin" element={<Admin/>} />
           <Route path="/candidates" element={<Candidates/>} />
           <Route path="/contact" element={<ContactForm/>} />
           <Route path="/about" element={<About/>} />
          </Routes>
        </div>
      </div>
    </Router>
    
  );
};

export default App;
