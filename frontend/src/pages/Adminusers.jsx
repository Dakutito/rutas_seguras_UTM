import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || `${API_URL}'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)

  // 1. CARGA REAL DESDE LA BASE DE DATOS
  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users');
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando usuarios de la DB:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 3000); // Se actualiza cada 3 segundos solo
    return () => clearInterval(interval);
  }, []);

  // 2. CAMBIAR ESTADO (SUSPENDER/ACTIVAR) EN DB
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const response = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) loadUsers();
    } catch (error) {
      alert("No se pudo cambiar el estado en la base de datos");
    }
  };

  // 3. ELIMINAR USUARIO DE LA DB
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario de la base de datos?')) return;
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) loadUsers();
    } catch (error) {
      alert("Error al eliminar el usuario");
    }
  };

  // Lógica de filtrado
  const filtered = users.filter(u => {
    if (filter === 'activos') return u.status === 'active'
    if (filter === 'suspendidos') return u.status === 'suspended'
    return true
  }).filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const totalReports = users.reduce((acc, curr) => acc + parseInt(curr.reports_count || 0), 0);

  if (loading && users.length === 0) return <div style={{color: 'white', textAlign: 'center', padding: '50px'}}>Conectando a PostgreSQL...</div>;

  return (
    <div className="container">
      <div className="gestionuseradinmodooscuro">
        
        <div className='sub_gestionuseradinmodooscuro'>
          <div>
            <h1>Gestión de Usuarios</h1>
            <p style={{ color: '#8898aa', marginTop: '5px' }}>{users.length} usuarios en la base de datos</p>
          </div>
          <Link to="/admin" style={{ background: '#6c757d', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
            ← Volver al Panel
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' }}>
          <div style={{ background: '#3b82f6', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', margin: 0 }}>{users.length}</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>Total Usuarios</p>
          </div>
          <div style={{ background: '#10b981', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', margin: 0 }}>{activeCount}</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>Activos</p>
          </div>
          <div style={{ background: '#ef4444', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', margin: 0 }}>{suspendedCount}</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>Suspendidos</p>
          </div>
          <div style={{ background: '#8b5cf6', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', margin: 0 }}>{totalReports}</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>Reportes Totales</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <input
            type="text"
            placeholder="Buscar en la base de datos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 20px', borderRadius: '10px', border: '1px solid #e0e6ed', outline: 'none' }}
          />
          <div style={{ display: 'flex', background: '#f8fafc', padding: '5px', borderRadius: '10px' }}>
            {['todos', 'activos', 'suspendidos'].map(f => (
              <button keyz={f} onClick={() => setFilter(f)} style={{ padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: filter === f ? '#4f46e5' : 'transparent', color: filter === f ? 'white' : '#64748b' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#8898aa', fontSize: '12px', textAlign: 'left', borderBottom: '1px solid #f0f2f5' }}>
                <th style={{ padding: '15px' }}>#</th>
                <th style={{ padding: '15px' }}>NOMBRE</th>
                <th style={{ padding: '15px' }}>CORREO</th>
                <th style={{ padding: '15px' }}>REGISTRADO</th>
                <th style={{ padding: '15px' }}>ESTADO</th>
                <th style={{ padding: '15px' }}>REPORTES</th>
                <th style={{ padding: '15px' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '14px' }}>
                  <td style={{ padding: '15px', color: '#8898aa' }}>{idx + 1}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>{user.email}</td>
                  <td style={{ padding: '15px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ background: user.status === 'active' ? '#dcfce7' : '#fee2e2', color: user.status === 'active' ? '#15803d' : '#b91c1c', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                      {user.status === 'active' ? '✓ Activo' : '✗ Suspendido'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>{user.reports_count || 0} reportes</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleToggleStatus(user.id, user.status)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        {user.status === 'active' ? 'Suspender' : 'Activar'}
                      </button>
                      <button onClick={() => handleDelete(user.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers