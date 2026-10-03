import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import useDottedScene from "../components/useDottedScene"
import PageNavigation from "../components/PageNavigation"
// Project data
const projects = [
  {
    title: "Sundown Studios",
    description: "A studio website project exploring motion, layout, and responsive frontend development.",
    tags: ["React", "GSAP", "Responsive Design", "Lenis"],
    source: "https://github.com/Anubhavera/Sundown_Studios",
    image: "/sundown.png",
    link: "https://sundown-studios-snowy.vercel.app/"
  },
  {
    title: "Sprintly",
    description: "A multi-tenant Kanban app with a React and TypeScript frontend and a Django/GraphQL backend.",
    tags: ["React", "Django", "GraphQL", "TypeScript"],
    source: "https://github.com/Anubhavera/Sprintly",
    image: "/sprintly.png"
  },
   {
    title: "Temporal Workflow Agent",
    description: "An experimental agent execution engine built around Temporal workflow orchestration.",
    tags: ["Temporal", "Architecture", "LLM", "React"],
    source: "https://github.com/Anubhavera/Temporal-Workflow-Agent",
    image: "/temporal.png"
  }

]

const Projects = () => {
  const mountRef = useDottedScene("projects")
  const dialogRef = useRef(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (preview && !dialogRef.current.open) dialogRef.current.showModal()
  }, [preview])

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      ></div>
      
      <main
        id="main-content" tabIndex={-1}
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
          <PageNavigation />
          
          <h1 className="page-title" data-route-heading tabIndex={-1}>Selected Work</h1>
          
          <p className="page-subtitle">
            Web applications, creative frontend development, and experiments in workflow orchestration.
          </p>
        </div>
        
        <div className="projects-grid" style={{ maxWidth: "900px" }}>
          {projects.map((project, index) => (
            <article
              key={index} 
              className="project-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <button type="button" className="project-card-image project-preview-button"
                aria-label={`Enlarge ${project.title} preview`} aria-haspopup="dialog"
                onClick={() => setPreview(project)}>
                <img src={project.image} alt={`${project.title} project preview`} loading="lazy" decoding="async" />
                <span className="preview-hint" aria-hidden="true">View preview ↗</span>
              </button>

              <div className="project-card-content">
                <h2 className="project-card-title">{project.title}</h2>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-tags">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="project-tag">{tag}</span>
                  ))}
                </div>
                <div className="project-actions">
                  {project.link && <a className="project-live-link" href={project.link} target="_blank" rel="noopener noreferrer">Live site <span aria-hidden="true">↗</span><span className="sr-only"> — {project.title}, opens in a new tab</span></a>}
                  <a className="project-live-link" href={project.source} target="_blank" rel="noopener noreferrer">Source code <span aria-hidden="true">↗</span><span className="sr-only"> — {project.title}, opens in a new tab</span></a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <footer className="page-next-step">
          <p>Have a role or project in mind?</p>
          <a href="mailto:hoodaanubhav@gmail.com">Let’s talk ↗</a>
          <Link to="/services">About & capabilities →</Link>
        </footer>
      </main>
      <dialog className="project-preview-dialog" ref={dialogRef} aria-labelledby="preview-title"
        onClose={() => setPreview(null)} onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current.close()
        }}>
        {preview && <div className="preview-inner">
          <header><h2 id="preview-title">{preview.title}</h2>
            <button type="button" onClick={() => dialogRef.current.close()} autoFocus>Close <span aria-hidden="true">×</span></button>
          </header>
          <img src={preview.image} alt={`${preview.title} full-size project preview`} />
          <p>Project screenshot · <a href={preview.source} target="_blank" rel="noopener noreferrer">Explore source code ↗</a></p>
        </div>}
      </dialog>
      
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
