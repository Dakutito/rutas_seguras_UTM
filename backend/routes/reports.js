const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// OBTENER TODOS LOS REPORTES CON INFO DEL USUARIO (Para Admin)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        er.id, 
        er.emotion, 
        er.emotion_label, 
        er.emotion_color, 
        er.comment,
        er.latitude::float as lat, 
        er.longitude::float as lng, 
        er.created_at,
        u.name as user_name,
        u.email as user_email
       FROM emotion_reports er
       LEFT JOIN users u ON er.user_id = u.id
       WHERE er.expires_at > NOW() 
       ORDER BY er.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// OBTENER REPORTES DEL USUARIO ACTUAL
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, 
        emotion, 
        emotion_label, 
        emotion_color, 
        comment,
        latitude::float as lat, 
        longitude::float as lng, 
        created_at
       FROM emotion_reports 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reportes del usuario:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// GUARDAR REPORTE
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { emotion, emotionLabel, emotionColor, comment, latitude, longitude } = req.body;
    const userId = req.user.id;

    const result = await query(
      `INSERT INTO emotion_reports 
       (user_id, emotion, emotion_label, emotion_color, comment, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [userId, emotion, emotionLabel, emotionColor, comment || null, latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar reporte:', error);
    res.status(500).json({ error: 'Error al guardar reporte' });
  }
});

// ELIMINAR REPORTE (Usuario solo puede eliminar sus propios reportes)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el reporte pertenece al usuario
    const checkResult = await query(
      'SELECT user_id FROM emotion_reports WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Si es admin o es su propio reporte, permitir eliminar
    if (req.user.role === 'admin' || checkResult.rows[0].user_id === userId) {
      await query('DELETE FROM emotion_reports WHERE id = $1', [id]);
      return res.json({ message: 'Reporte eliminado correctamente' });
    }

    res.status(403).json({ error: 'No tienes permiso para eliminar este reporte' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ error: 'Error al eliminar reporte' });
  }
});

module.exports = router;