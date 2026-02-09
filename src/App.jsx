import React from "react"
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./assets/pages/Home"
import Projects from "./assets/pages/Projects"
import Services from "./assets/pages/Services"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/services" element={<Services />} />
      </Routes>
    </Router>
  )
}

export default App
