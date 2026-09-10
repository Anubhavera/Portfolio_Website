import { useNavigate } from "react-router-dom"
import useDottedScene from "../components/useDottedScene"
// Project data
const projects = [
  {
    title: "Sundown Studios",
    description: "A studio website project exploring motion, layout, and responsive frontend development.",
    tags: ["React", "GSAP", "Responsive Design", "Lenis"],
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    image: "/sundown.png",
    link: "https://sundown-studios-snowy.vercel.app/"
  },
  {
    title: "Sprintly",
    description: "A multi-tenant Kanban app with a React and TypeScript frontend and a Django/GraphQL backend.",
    tags: ["React", "Django", "GraphQL", "TypeScript"],
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    image: "/sprintly.png"
  },
   {
    title: "Temporal Workflow Agent",
    description: "An experimental agent execution engine built around Temporal workflow orchestration.",
    tags: ["Temporal", "Architecture", "LLM", "React"],
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    image: "/temporal.png"
  }

]

const Projects = () => {
  const navigate = useNavigate()
  const mountRef = useDottedScene("projects")

  const handleBackToHome = () => {
    // Navigate with state to trigger zoom-out animation
    navigate("/", { state: { fromPage: 'projects' } })
  }

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      ></div>
      
      <main
        className="projects-page-content"
        style={{
          position: "relative",
          zIndex: 10,
          height: "100dvh",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "2rem",
          paddingTop: "3rem",
          paddingRight: "35%",
          animation: "slideInFromLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ width: "100%", maxWidth: "900px", marginBottom: "2rem" }}>
          <button 
            onClick={handleBackToHome}
            className="back-btn"
          >
            ← Back to Home
          </button>
          
          <h1 className="page-title">Selected Work</h1>
          
          <p className="page-subtitle">
            Web applications, creative frontend development, and experiments in workflow orchestration.
          </p>
        </div>
        
        <div className="projects-grid" style={{ maxWidth: "900px" }}>
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="project-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="project-card-image">
                <img src={project.image} alt={`${project.title} project preview`} loading="lazy" decoding="async" />
              </div>

              <div className="project-card-content">
                <h2 className="project-card-title">{project.title}</h2>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-tags">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="project-tag">{tag}</span>
                  ))}
                </div>
                {project.link && <a className="project-live-link" href={project.link} target="_blank" rel="noopener noreferrer">Visit live site <span aria-hidden="true">↗</span><span className="sr-only"> — {project.title}</span></a>}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
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
        
        .project-card {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        @media (max-width: 1200px) {
          .projects-page-content {
            padding-right: 2rem !important;
          }
          
          .projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

export default Projects