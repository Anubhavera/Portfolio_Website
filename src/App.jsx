import "./App.css"
import "./assets/pages/refined-home.css"
import "./refinements.css"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
// import Home from "./assets/pages/Home"
import Home from "./assets/pages/refined-home"
import Projects from "./assets/pages/Projects"
import Services from "./assets/pages/Services"
import RouteEffects from "./assets/components/RouteEffects"

function App() {
  return (
    <Router>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/services" element={<Services />} />
        <Route path="*" element={<main id="main-content" className="not-found" tabIndex={-1}>
          <h1 data-route-heading tabIndex={-1}>Page not found</h1>
          <p>This address doesn’t lead to a page. Explore my work or return home.</p>
          <Link to="/">Back to home</Link><Link to="/projects">Selected work ↗</Link>
        </main>} />
      </Routes>
    </Router>
  )
}

export default App
