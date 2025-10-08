import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LogIn } from 'lucide-react'
import RequestCompanyForm from '../components/forms/RequestCompanyForm'

const WelcomePage = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="public/video/Présentation1.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/30 z-10" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <img 
                src="public/image/infinity.png" 
                alt="Logo" 
                className="h-12 w-12 relative z-10"
              />
            </div>
            <div>
              <span className="text-white text-xl font-semibold">Infinity companies</span>
              <p className="text-xs text-gray-400">Gestion des salaires simplifiée</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 
              hover:bg-white/20 text-white rounded-xl backdrop-blur-md
              border border-white/10 transition-all duration-300
              hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
          >
            <LogIn size={20} />
            <span>Connexion</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 min-h-screen flex items-center">
        <div className={`max-w-2xl transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
            Gestion des salaires  nouvelle génération

          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Une plateforme intelligente qui transforme la gestion de vos employés
            et automatise vos processus de paie.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group px-8 py-4 bg-white/10 
              hover:bg-white/20 text-white 
              rounded-xl font-medium flex items-center gap-3
              transform transition-all duration-300 hover:scale-105
              hover:shadow-xl hover:shadow-primary/20"
          >
            <span>Faire une demande</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <RequestCompanyForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

export default WelcomePage