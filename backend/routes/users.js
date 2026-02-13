const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Obtener lista de usuarios para el Admin
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.created_at, 
        u.status,
        (SELECT COUNT(*) FROM emotion_reports WHERE user_id = u.id) as reports_count
       FROM users u
       WHERE u.role = 'user'
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Cambiar estado (Suspender/Activar)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;