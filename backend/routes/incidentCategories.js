const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// OBTENER TODAS LAS CATEGORÍAS
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM incident_categories ORDER BY display_order ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// CREAR NUEVA CATEGORÍA (Solo Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    if (!name || !icon || !color) {
      return res.status(400).json({ error: 'Nombre, ícono y color son requeridos' });
    }

    // Obtener el último orden
    const lastOrder = await query(
      'SELECT MAX(display_order) as max_order FROM incident_categories'
    );
    const newOrder = (lastOrder.rows[0].max_order || 0) + 1;

    const result = await query(
      `INSERT INTO incident_categories (name, icon, color, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, icon, color, newOrder]
    );

    res.status(201).json({
      message: 'Categoría creada correctamente',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// ACTUALIZAR CATEGORÍA (Solo Admin)
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const result = await query(
      `UPDATE incident_categories 
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           color = COALESCE($3, color)
       WHERE id = $4
       RETURNING *`,
      [name, icon, color, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({
      message: 'Categoría actualizada',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// ELIMINAR CATEGORÍA (Solo Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const incidents = await query(
      'SELECT COUNT(*) as count FROM incident_reports WHERE category_id = $1',
      [id]
    );

    if (parseInt(incidents.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'No puedes eliminar esta categoría porque tiene reportes asociados'
      });
    }

    const result = await query(
      'DELETE FROM incident_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// REORDENAR CATEGORÍAS (Solo Admin)
router.post('/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categories } = req.body; // Array de { id, display_order }

    for (const cat of categories) {
      await query(
        'UPDATE incident_categories SET display_order = $1 WHERE id = $2',
        [cat.display_order, cat.id]
      );
    }

    res.json({ message: 'Orden actualizado' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al reordenar' });
  }
});

module.exports = router;