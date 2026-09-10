import { useNavigate } from "react-router-dom"
import useDottedScene from "../components/useDottedScene"
// Service categories data
const serviceCategories = [
  {
    title: "DESIGN SERVICES",
    services: ["Web Design", "App Design", "3D Design", "UI/UX Design", "Prototyping"]
  },
  {
    title: "DEVELOPMENT SERVICES",
    services: [
      "Frontend Development",
      "Backend Development",
      "Full Stack",
      "API Development",
      "Database Design"
    ]
  },
  {
    title: "TECHNOLOGIES",
    services: [
      "React",
      "Next.js",
      "Three.js",
      "Node.js",
      "Python",
      "TypeScript",
      "PostgreSQL",
      "AWS",
      "Firebase"
    ]
  },
  {
    title: "AI & MACHINE LEARNING",
    services: [
      "LLM Integration",
      "Model Training",
      "RAG Systems",
      "Computer Vision",
      "NLP"
    ]
  }
]

const Services = () => {
  const navigate = useNavigate()
  const mountRef = useDottedScene("services")

  const handleBackToHome = () => {
    // Navigate with state to trigger zoom-out animation
    navigate("/", { state: { fromPage: 'services' } })
  }

  return (
    <>
      <div
        id="canvas-container"
        ref={mountRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      ></div>
      
      <main className="services-container">
        <div 
          className="services-content"
          style={{ animation: "slideInFromRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <button 
            onClick={handleBackToHome}
            className="back-btn"
          >
            ← Back to Home
          </button>
          
          <div className="services-intro">
            <h1 className="page-title">About & Capabilities</h1>
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