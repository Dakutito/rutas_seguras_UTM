import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Components.css'

import { usersAPI } from '../services/api'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)

  // 1. CARGA REAL DESDE LA BASE DE DATOS
  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll()
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
      await usersAPI.updateStatus(id, newStatus)
      loadUsers();
    } catch (error) {
      alert("No se pudo cambiar el estado en la base de datos");
    }
  };

  // 3. ELIMINAR USUARIO DE LA DB
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario de la base de datos?')) return;
    try {
      await usersAPI.delete(id)
      loadUsers();
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

  if (loading && users.length === 0) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Conectando a PostgreSQL...</div>;

  return (
    <div className="container">
      <div className="gestionuseradinmodooscuro">

        <div className='sub_gestionuseradinmodooscuro'>
          <div>
            <h1>Gestión de Usuarios</h1>
            <p className="admin-desc-text">{users.length} usuarios en la base de datos</p>
          </div>
        </div>

        <div className="admin-stats-grid-simple">
          <div className="admin-stat-card-blue">
            <h2 className="admin-stat-num">{users.length}</h2>
            <p className="admin-stat-label-simple">Total Usuarios</p>
          </div>
          <div className="admin-stat-card-green">
            <h2 className="admin-stat-num">{activeCount}</h2>
            <p className="admin-stat-label-simple">Activos</p>
          </div>
          <div className="admin-stat-card-red">
            <h2 className="admin-stat-num">{suspendedCount}</h2>
            <p className="admin-stat-label-simple">Suspendidos</p>
          </div>
          <div className="admin-stat-card-purple">
            <h2 className="admin-stat-num">{totalReports}</h2>
            <p className="admin-stat-label-simple">Reportes Totales</p>
          </div>
        </div>

        <div className="admin-filter-bar">
          <input
            type="text"
            placeholder="Buscar en la base de datos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input-full"
          />
          <div className="admin-filter-pills">
            {['todos', 'activos', 'suspendidos'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'active' : ''}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr className="table-header-row">
                <th>#</th>
                <th>NOMBRE</th>
                <th>CORREO</th>
                <th>REGISTRADO</th>
                <th>ESTADO</th>
                <th>REPORTES</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={user.id} className="table-data-row">
                  <td className="table-cell-idx">{idx + 1}</td>
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