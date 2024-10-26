import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Studio from "./components/Studio";
import Warehouse from "./components/Warehouse";
import "./App.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/warehouse" element={<Warehouse />} />
            </Routes>
        </Router>
    );
}

export default App;
