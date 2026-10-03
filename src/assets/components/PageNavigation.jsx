import { NavLink, useLocation } from 'react-router-dom'
import MotionControl from './MotionControl'

export default function PageNavigation() {
  const { pathname } = useLocation()
  return (
    <header className="page-navigation">
      <nav aria-label="Main navigation">
        <NavLink to="/" state={{ fromPage: pathname === '/services' ? 'services' : 'projects' }}>Home</NavLink>
        <NavLink to="/projects">Work</NavLink>
        <NavLink to="/services">About</NavLink>
        <a href="mailto:hoodaanubhav@gmail.com">Contact <span aria-hidden="true">↗</span></a>
      </nav>
      <MotionControl />
    </header>
  )
}
