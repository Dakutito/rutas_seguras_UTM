import { Link } from 'react-router-dom'
import { getUser } from '../services/authService'
import '../styles/home.css'
import QRSection from '../components/QRSection'
import { FiMap, FiHeart, FiBell, FiZap, FiShield, FiBookOpen } from 'react-icons/fi'

const Home = () => {
  const user = getUser()

  return (

    <div className="home-container">

      <section className="hero">
        <div>
          <div className="badge">Universidad Técnica de Manabí</div>
          <h1>Rutas Seguras</h1>
          <h1 style={{ color: '#0056A4' }}>Portoviejo</h1>
          <p>
            Plataforma colaborativa que integra seguridad urbana, bienestar emocional
            y ciudadanía digital para la comunidad universitaria y el cantón Portoviejo.
          </p>
          <div className="actions">
            <Link to="/mapa-reportes" className="btn" style={{ backgroundColor: '#667eea', color: '#fff' }}>
              Ver Mapa
            </Link>
            <Link to="/map-reporte" className="btn btn-outline">
              Reportar Incidente
            </Link>
          </div>
        </div>

        <div className="emotion-card">
          <h3>¿Cómo te sientes ahora?</h3>
          <div className="location">📍 Ubicación detectada</div>

          <div className="emotions">
            <div className="emotion" style={{ background: '#DBFCE7', border: '3px solid #92F4B7' }}><span>😊</span><h4>Feliz</h4></div>
            <div className="emotion" style={{ background: '#DBEAFE', border: '3px solid #8EC5FF' }}><span>😌</span><h4>Tranquilo/a</h4></div>
            <div className="emotion" style={{ background: '#FEF3C6', border: '3px solid #FED951' }}><span>😰</span><h4>Ansioso/a</h4></div>
            <div className="emotion" style={{ background: '#FFEDD4', border: '3px solid #FFB86A' }}><span>😨</span><h4>Asustado/a</h4></div>

            <div className="emotion" style={{ background: '#F3E8FF', border: '3px solid #DAB2FF' }}><span>😢</span><h4>Triste</h4></div>
            <div className="emotion" style={{ background: '#FFE2E2', border: '3px solid #FFA2A2' }}><span>😠</span><h4>Enojado/a</h4></div>
            <div className="emotion" style={{ background: '#F3F4F6', border: '3px solid #D1D5DC' }}><span>😐</span><h4>Neutral</h4></div>

          </div>
          <Link to="/map" className="btn" style={{ backgroundColor: '#667eea', color: '#fff', padding: '15px 40px', fontSize: '18px' }}>
            Registrar Emoción
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Tres Componentes Integrados</h2>
        <p>
          Una solución interdisciplinaria que combina trabajo social, psicología,
          derecho, sociología, bibliotecología e ingeniería.
        </p>

        <div className="cards">
          <div className="cardss">
            <Link to="/mapa-reportes" className="card-link" style={{ textDecoration: 'none' }}>
              <div className="icon-wrapper blue">
                <FiMap />
              </div>
              <h4>Mapeo de Rutas Seguras</h4>
              <p>Visualiza zonas seguras e incidentes reportados en tiempo real.</p>
            </Link>
          </div>

          <div className="cardss">
            <Link to="/map" className="card-link" style={{ textDecoration: 'none' }}>
              <div className="icon-wrapper red">
                <FiHeart />
              </div>
              <h4>Bienestar Emocional</h4>
              <p>Registra tu estado emocional y contribuye al mapa comunitario.</p>
            </Link>
          </div>

          <div className="cardss">
            <Link to="/map-reporte" className="card-link" style={{ textDecoration: 'none' }}>
              <div className="icon-wrapper orange">
                <FiBell />
              </div>
              <h4>Sistema de Reportes</h4>
              <p>Reporta incidentes de seguridad para alertar a la comunidad.</p>
            </Link>
          </div>

          <div className="cardss">
            <Link to="/home" className="card-link" style={{ textDecoration: 'none' }}>
              <div className="icon-wrapper green">
                <FiZap />
              </div>
              <h4>Iniciativas Ciudadanas</h4>
              <p>Propón proyectos comunitarios para mejorar la seguridad.</p>
            </Link>
          </div>

          <div className="cardss">
            <Link to="/home" className="card-link" style={{ textDecoration: 'none' }}>
              <div className="icon-wrapper purple">
                <FiShield />
              </div>
              <h4>Embajadores Digitales</h4>
              <p >Universitarios promoviendo buenas prácticas digitales.</p>
            </Link>
          </div>

          <div className="cardss">
            <Link to="/recursos" className="card-link" style={{ textDecoration: 'none' }}>
              <div className="icon-wrapper indigo">
                <FiBookOpen />
              </div>
              <h4>Recursos Educativos</h4>
              <p>Aprende sobre seguridad urbana y bienestar emocional.</p>
            </Link>
          </div>

        </div>
      </section>

      <QRSection />
      {!user && (
        <section className="cta">
          <h2>Únete a la comunidad segura</h2>
          <p>
            Regístrate para reportar incidentes, proponer iniciativas y convertirte
            en embajador digital de tu barrio.
          </p>
          <div className="actions" style={{ justifyContent: 'center' }}>
            <div>
              <Link to="/register" className="btn" style={{ backgroundColor: '#667eea', color: '#fff' }}>
                Crear Cuenta
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className='footerhome'>
        <div>Rutas Seguras UTM</div>
        <div>Universidad Técnica de Manabí - Portoviejo, Ecuador</div>
      </footer>

    </div>


  )
}

export default Home