import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const pages = {
  '/': ['Anubhav Hooda — Design Engineer', 'Anubhav Hooda is a developer based in New Delhi, building web applications and interactive experiences.'],
  '/projects': ['Selected Work — Anubhav Hooda', 'Explore Anubhav Hooda’s web applications, creative frontend projects, and workflow orchestration experiments.'],
  '/services': ['About & Capabilities — Anubhav Hooda', 'Meet Anubhav Hooda, a developer working across web applications, interactive graphics, and workflow orchestration.'],
}

export default function RouteEffects() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useEffect(() => {
    const [title, description] = pages[pathname.replace(/\/$/, '') || '/'] || ['Page not found — Anubhav Hooda', 'Return to Anubhav Hooda’s portfolio.']
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://www.anubhavhooda.dev${pathname}`)
    if (!pages[pathname.replace(/\/$/, '') || '/']) {
      document.fonts.ready.then(() => window.dispatchEvent(new Event('portfolio:ready')))
    }
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0)
      document.querySelector('[data-route-heading]')?.focus({ preventScroll: true })
    }
    previousPath.current = pathname
  }, [pathname])
  return <a className="skip-link" href="#main-content">Skip to content</a>
}
