// backend/routes/incidents.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// OBTENER TODOS LOS INCIDENTES (Público - con email)
router.get('/', async (req, res) => {
  try {
    const { type, status = 'activo' } = req.query;
    
    let queryText = `
      SELECT 
        ir.id,
        ir.incident_type,
        ir.description,
        ir.latitude::float as lat,
        ir.longitude::float as lng,
        ir.created_at,
        ir.status,
        u.name as user_name,
        u.email as user_email
      FROM incident_reports ir
      LEFT JOIN users u ON ir.user_id = u.id
      WHERE ir.status = $1
    `;
    
    const params = [status];
    
    if (type) {
      queryText += ` AND ir.incident_type = $2`;
      params.push(type);
    }
    
    queryText += ` ORDER BY ir.created_at DESC`;
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    res.status(500).json({ error: 'Error al obtener incidentes' });
  }
});

// OBTENER INCIDENTES CON DATOS COMPLETOS (Solo Admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        ir.*,
        u.name as user_name,
        u.email as user_email,
        resolver.name as resolved_by_name
       FROM incident_reports ir
       LEFT JOIN users u ON ir.user_id = u.id
       LEFT JOIN users resolver ON ir.resolved_by = resolver.id
       ORDER BY ir.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener incidentes (admin):', error);
    res.status(500).json({ error: 'Error al obtener incidentes' });
  }
});

// OBTENER MIS INCIDENTES
router.get('/my-incidents', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id,
        incident_type,
        description,
        latitude::float as lat,
        longitude::float as lng,
        created_at,
        status
       FROM incident_reports
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener mis incidentes:', error);
    res.status(500).json({ error: 'Error al obtener incidentes' });
  }
});

// CREAR NUEVO INCIDENTE
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { incident_type, description, latitude, longitude } = req.body;
    
    if (!incident_type || !latitude || !longitude) {
      return res.status(400).json({ error: 'Tipo de incidente y ubicación son requeridos' });
    }
    
    const validTypes = ['Robo', 'Asalto', 'Acoso', 'Vandalismo', 'Iluminación', 'Infraestructura', 'Sospechoso', 'Otro'];
    if (!validTypes.includes(incident_type)) {
      return res.status(400).json({ error: 'Tipo de incidente inválido' });
    }
    
    const result = await query(
      `INSERT INTO incident_reports 
       (user_id, incident_type, description, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, incident_type, description || null, latitude, longitude]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear incidente:', error);
    res.status(500).json({ error: 'Error al crear incidente' });
  }
});

// MARCAR INCIDENTE COMO RESUELTO (Solo Admin)
router.patch('/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `UPDATE incident_reports
       SET status = 'resuelto',
           resolved_by = $1,
           resolved_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' });
    }
    
    res.json({ message: 'Incidente marcado como resuelto', incident: result.rows[0] });
  } catch (error) {
    console.error('Error al resolver incidente:', error);
    res.status(500).json({ error: 'Error al resolver incidente' });
  }
});

// ELIMINAR INCIDENTE
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permisos
    const checkResult = await query(
      'SELECT user_id FROM incident_reports WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente no encontrado' });
    }
    
    // Admin puede eliminar cualquier incidente, usuario solo los suyos
    if (req.user.role === 'admin' || checkResult.rows[0].user_id === req.user.id) {
      await query('DELETE FROM incident_reports WHERE id = $1', [id]);
      return res.json({ message: 'Incidente eliminado correctamente' });
    }
    
    res.status(403).json({ error: 'No tienes permiso para eliminar este incidente' });
  } catch (error) {
    console.error('Error al eliminar incidente:', error);
    res.status(500).json({ error: 'Error al eliminar incidente' });
  }
});

// OBTENER ESTADÍSTICAS DE INCIDENTES
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(
      `SELECT 
        incident_type,
        COUNT(*) as count
       FROM incident_reports
       WHERE status = 'activo'
       GROUP BY incident_type
       ORDER BY count DESC`
    );
    
    const total = await query(
      "SELECT COUNT(*) as count FROM incident_reports WHERE status = 'activo'"
    );
    
    res.json({
      total: parseInt(total.rows[0].count),
      byType: stats.rows
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;