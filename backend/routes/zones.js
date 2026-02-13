const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// OBTENER TODAS LAS ZONAS DE RIESGO
router.get('/', async (req, res) => {
  try {
    // Actualizar zonas antes de devolver
    await query('SELECT update_risk_zones()');

    const result = await query(
      `SELECT 
        id,
        latitude::float as lat,
        longitude::float as lng,
        danger_level,
        report_count,
        last_emotion,
        last_emotion_color,
        updated_at
       FROM risk_zones 
       ORDER BY danger_level DESC, report_count DESC`
    );

    res.json({
      count: result.rows.length,
      zones: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo zonas:', error);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
});

// OBTENER ZONAS POR NIVEL DE PELIGRO
router.get('/danger/:level', async (req, res) => {
  try {
    const { level } = req.params;

    if (!['bajo', 'medio', 'alto'].includes(level)) {
      return res.status(400).json({ error: 'Nivel de peligro inválido. Use: bajo, medio, alto' });
    }

    const result = await query(
      `SELECT 
        id,
        latitude::float as lat,
        longitude::float as lng,
        danger_level,
        report_count,
        last_emotion,
        last_emotion_color,
        updated_at
       FROM risk_zones 
       WHERE danger_level = $1
       ORDER BY report_count DESC`,
      [level]
    );

    res.json({
      dangerLevel: level,
      count: result.rows.length,
      zones: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo zonas por peligro:', error);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
});

// BUSCAR ZONAS CERCANAS A UNA UBICACIÓN
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 0.01 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Se requieren parámetros lat y lng' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    const result = await query(
      `SELECT 
        id,
        latitude::float as lat,
        longitude::float as lng,
        danger_level,
        report_count,
        last_emotion,
        last_emotion_color,
        updated_at,
        SQRT(
          POWER(latitude - $1, 2) + POWER(longitude - $2, 2)
        ) as distance
       FROM risk_zones
       WHERE latitude BETWEEN $1 - $3 AND $1 + $3
         AND longitude BETWEEN $2 - $3 AND $2 + $3
       ORDER BY distance ASC
       LIMIT 20`,
      [latitude, longitude, searchRadius]
    );

    res.json({
      location: { lat: latitude, lng: longitude },
      radius: searchRadius,
      count: result.rows.length,
      zones: result.rows
    });

  } catch (error) {
    console.error('Error buscando zonas cercanas:', error);
    res.status(500).json({ error: 'Error al buscar zonas cercanas' });
  }
});

module.exports = router;