import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Recursos.css'

const RecursosEducativos = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState('seguridad')

  return (
    <div className="recursos-container">

      {/* VOLVER */}
      <button className="btn-volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>Recursos Educativos</h1>
      <p className="subtitle">
        Material de apoyo sobre seguridad urbana, bienestar emocional y ciudadanía digital
      </p>

      {/* VIDEO DESTACADO */}
      <div className="video-card">
        <div className="video-preview">
          ▶
        </div>

        <div className="video-info">
          <div className="badge-video"><span>Video Destacado</span></div>
          <h3>Introducción a Rutas Seguras UTM</h3>
          <p>
            Conoce cómo funciona la plataforma y cómo puedes contribuir a crear
            una comunidad más segura en Portoviejo.
          </p>
          <button className="btn-vervideo" onClick={() => navigate('/recursos/introduccion')}>Ver video (5 min)</button>
        </div>
      </div>

      {/* TABS MEJORADOS PARA MÓVIL */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={tab === 'seguridad' ? 'active' : ''}
            onClick={() => setTab('seguridad')}
          >
            <span className="tab-text">Seguridad</span>
          </button>

          <button
            className={tab === 'bienestar' ? 'active' : ''}
            onClick={() => setTab('bienestar')}
          >
            <span className="tab-text">Bienestar</span>
          </button>

          <button
            className={tab === 'digital' ? 'active' : ''}
            onClick={() => setTab('digital')}
          >
            <span className="tab-text">Digital</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DINÁMICO - RESPONSIVE */}
      <div className="tab-content">
        {tab === 'seguridad' && (
          <div className="cards-grid">
            <Card
              img="/img/Seguridad/SeguridadUrbana.png"
              title="Guía de Seguridad Urbana"
              desc="Consejos prácticos para desplazarte de forma segura"
              tag="Guía"
              onClick={() => navigate('/recursos/seguridad-urbana')}
            />
            <Card
              img="/img/Seguridad/reporincident.png"
              title="Cómo reportar incidentes"
              desc="Tutorial paso a paso del sistema de reportes"
              tag="Tutorial"
              onClick={() => navigate('/recursos/reportar-incidentes')}
            />
            <Card
              img="/img/Seguridad/numeemer.png"
              title="Números de emergencia"
              desc="ECU 911, Policía, Bomberos"
              tag="Referencia"
              onClick={() => navigate('/recursos/numeros-emergencia')}
            />
            <Card
              img="/img/Seguridad/img_mapa.png"
              title="Rutas seguras en Portoviejo"
              desc="Mapa interactivo de zonas seguras"
              tag="Mapa"
              onClick={() => navigate('/recursos/rutas-portoviejo')}
            />
          </div>
        )}

        {tab === 'bienestar' && (
          <div className="cards-grid">
            <Card
              img="/img/Bienestar/ManejoEstres.png"
              title="Manejo del estrés académico"
              desc="Técnicas de relajación y mindfulness"
              tag="Curso"
              onClick={() => navigate('/recursos/manejo-estres')}
            />
            <Card
              img="/img/Bienestar/PrimerAuxilio.png"
              title="Primeros auxilios emocionales"
              desc="Cómo ayudar a alguien en crisis emocional"
              tag="Guía"
              onClick={() => navigate('/recursos/primeros-auxilios')}
            />
            <Card
              img="/img/Bienestar/ApoyoPsicolo.png"
              title="Líneas de apoyo psicológico"
              desc="Servicios gratuitos de salud mental"
              tag="Referencia"
              onClick={() => navigate('/recursos/apoyo-psicologico')}
            />
            <Card
              img="/img/Bienestar/BienestarDigi.png"
              title="Bienestar digital"
              desc="Balance saludable con la tecnología"
              tag="Artículo"
              onClick={() => navigate('/recursos/bienestar-digital')}
            />
          </div>
        )}

        {tab === 'digital' && (
          <div className="cards-grid">
            <Card
              img="/img/Digital/Ciudaddigi.png"
              title="Ciudadanía digital"
              desc="Uso responsable de plataformas digitales"
              tag="Guía"
              onClick={() => navigate('/recursos/ciudadania-digital')}
            />
            <Card
              img="/img/Digital/preveestafa.png"
              title="Prevención de estafas"
              desc="Cómo identificar fraudes en línea"
              tag="Seguridad"
              onClick={() => navigate('/recursos/prevencion-estafas')}
            />
            <Card
              img="/img/Digital/Protestafa.png"
              title="Protección de datos"
              desc="Cuida tu información personal"
              tag="Artículo"
              onClick={() => navigate('/recursos/proteccion-datos')}
            />
          </div>
        )}
      </div>

    </div>
  )
}

const Card = ({ title, desc, tag, img, onClick }) => (
  <div className="recurso-card">
    <div className="card-header">
      {img && <img src={img} alt={title} className="card-image" />}
      <span className="tag">{tag}</span>
    </div>
    <div className="card-body">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
    <div className="card-footer">
      <button onClick={onClick} className="card-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}>Ver recurso ↗</button>
    </div>
  </div>
)

export default RecursosEducativos
