import { Link } from "react-router-dom"
import useDottedScene from "../components/useDottedScene"
import PageNavigation from "../components/PageNavigation"
// Keep capabilities focused on the work visitors can explore in the portfolio.
const serviceCategories = [
  {
    title: "WEB APPLICATIONS",
    services: ["React", "TypeScript", "Django", "GraphQL", "Database Design"]
  },
  {
    title: "INTERACTIVE INTERFACES",
    services: ["Three.js", "GSAP", "Responsive Design", "UI/UX Design"]
  },
  {
    title: "WORKFLOW SYSTEMS",
    services: ["Python", "Temporal", "LLM Integration", "API Development"]
  }
]

const Services = () => {
  const mountRef = useDottedScene("services")

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      ></div>
      
      <main className="services-container" id="main-content" tabIndex={-1}>
        <div 
          className="services-content"
          style={{ animation: "slideInFromRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <PageNavigation />
          
          <div className="services-intro">
            <h1 className="page-title" data-route-heading tabIndex={-1}>About & Capabilities</h1>
            <p className="page-subtitle">I’m Anubhav, a developer based in New Delhi. I work across web applications, interactive graphics, and workflow orchestration.</p>
          </div>

          {serviceCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex} 
              className="services-category"
              style={{ 
                animation: `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                animationDelay: `${categoryIndex * 0.1}s`,
                opacity: 0
              }}
            >
              <h2 className="services-category-title">{category.title}</h2>
              <div className="services-pills">
                {category.services.map((service, serviceIndex) => (
                  <span 
                    key={serviceIndex} 
                    className="service-pill"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <footer className="page-next-step">
            <p>See these skills in practice.</p>
            <Link to="/projects">Explore selected work →</Link>
            <a href="mailto:hoodaanubhav@gmail.com">Get in touch ↗</a>
          </footer>
        </div>
      </main>
      
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default Services
