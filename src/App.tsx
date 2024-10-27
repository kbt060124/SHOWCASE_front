import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import Warehouse from "./pages/Warehouse";
import Babylon from "./pages/Babylon";
import "./App.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/warehouse" element={<Warehouse />} />
								<Route path="/babylon" element={<Babylon />}  />
            </Routes>
        </Router>
    );
}

export default App;
