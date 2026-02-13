import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token no encontrado');
      return;
    }

    verifyEmail(token);
  }, [location]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/verify-email/${token}`
      );

      setStatus('success');
      setMessage(response.data.message);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Error al verificar el email');
    }
  };

  return (
    <div className="verify-email-container">
      {status === 'loading' && (
        <div className="status-box">
          <div className="spinner">⏳</div>
          <h2>Verificando tu email...</h2>
        </div>
      )}

      {status === 'success' && (
        <div className="status-box success">
          <div className="icon">✅</div>
          <h2>¡Email Verificado!</h2>
          <p>{message}</p>
          <p>Serás redirigido al login...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="status-box error">
          <div className="icon">❌</div>
          <h2>Error de Verificación</h2>
          <p>{message}</p>
          <button onClick={() => navigate('/login`)}>
            Ir al Login
          </button>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;