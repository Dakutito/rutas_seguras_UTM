const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ESTADÍSTICAS GENERALES (público)
router.get('/general', async (req, res) => {
  try {
    // Total de reportes activos
    const totalReports = await query(
      `SELECT (SELECT COUNT(*) FROM emotion_reports WHERE expires_at > NOW()) + 
              (SELECT COUNT(*) FROM incident_reports WHERE status = 'activo') as count`
    );

    // Reportes por emoción
    const reportsByEmotion = await query(
      `SELECT 
        emotion_label, 
        COUNT(*) as count,
        emotion_color
       FROM emotion_reports 
       WHERE expires_at > NOW()
       GROUP BY emotion_label, emotion_color
       ORDER BY count DESC`
    );

    // Zonas por nivel de peligro
    const zonesByDanger = await query(
      `SELECT 
        danger_level, 
        COUNT(*) as count
       FROM risk_zones
       GROUP BY danger_level`
    );

    // Reportes de hoy
    const todayReports = await query(
      `SELECT (SELECT COUNT(*) FROM emotion_reports WHERE DATE(created_at) = CURRENT_DATE) + 
              (SELECT COUNT(*) FROM incident_reports WHERE DATE(created_at) = CURRENT_DATE) as count`
    );

    // Emociones positivas vs negativas
    const positiveEmotions = await query(
      `SELECT COUNT(*) as count 
       FROM emotion_reports 
       WHERE emotion IN ('😊', '😌', '😐')
       AND expires_at > NOW()`
    );

    const negativeEmotions = await query(
      `SELECT COUNT(*) as count 
       FROM emotion_reports 
       WHERE emotion IN ('😰', '😨', '😢', '😡')
       AND expires_at > NOW()`
    );

    res.json({
      totalReports: parseInt(totalReports.rows[0].count),
      todayReports: parseInt(todayReports.rows[0].count),
      positiveCount: parseInt(positiveEmotions.rows[0].count),
      negativeCount: parseInt(negativeEmotions.rows[0].count),
      reportsByEmotion: reportsByEmotion.rows,
      zonesByDanger: zonesByDanger.rows.reduce((acc, row) => {
        acc[row.danger_level] = parseInt(row.count);
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ESTADÍSTICAS DE ADMINISTRADOR (solo admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Usuarios activos
    const activeUsers = await query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'active' AND role = 'user'"
    );

    // Usuarios suspendidos
    const suspendedUsers = await query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'suspended'"
    );

    // Total de usuarios
    const totalUsers = await query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
    );

    // Reportes por día (últimos 7 días)
    const reportsByDay = await query(
      `SELECT date, SUM(count) as count FROM (
        SELECT DATE(created_at) as date, COUNT(*) as count FROM emotion_reports 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY DATE(created_at)
        UNION ALL
        SELECT DATE(created_at) as date, COUNT(*) as count FROM incident_reports 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY DATE(created_at)
      ) combined
      GROUP BY date
      ORDER BY date DESC`
    );

    // Top 5 usuarios más activos
    const topUsers = await query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        (SELECT COUNT(*) FROM emotion_reports WHERE user_id = u.id) + 
        (SELECT COUNT(*) FROM incident_reports WHERE user_id = u.id) as report_count
       FROM users u
       WHERE u.role = 'user'
       ORDER BY report_count DESC
       LIMIT 5`
    );

    // Zonas más peligrosas
    const dangerousZones = await query(
      `SELECT 
        latitude::float as lat,
        longitude::float as lng,
        danger_level,
        report_count,
        last_emotion,
        last_emotion_color
       FROM risk_zones
       WHERE danger_level = 'alto'
       ORDER BY report_count DESC
       LIMIT 10`
    );

    // Actividad reciente
    const recentActivity = await query(
      `SELECT 
        al.action,
        al.description,
        al.created_at,
        u.name as user_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 20`
    );

    res.json({
      users: {
        total: parseInt(totalUsers.rows[0].count),
        active: parseInt(activeUsers.rows[0].count),
        suspended: parseInt(suspendedUsers.rows[0].count)
      },
      reportsByDay: reportsByDay.rows,
      topUsers: topUsers.rows,
      dangerousZones: dangerousZones.rows,
      recentActivity: recentActivity.rows
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de admin:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ESTADÍSTICAS DE USUARIO (propio)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    // Total de reportes del usuario
    const totalReports = await query(
      'SELECT COUNT(*) as count FROM emotion_reports WHERE user_id = $1',
      [req.user.id]
    );

    // Reportes activos
    const activeReports = await query(
      'SELECT COUNT(*) as count FROM emotion_reports WHERE user_id = $1 AND expires_at > NOW()',
      [req.user.id]
    );

    // Emoción más reportada
    const mostReportedEmotion = await query(
      `SELECT 
        emotion_label,
        COUNT(*) as count
       FROM emotion_reports
       WHERE user_id = $1
       GROUP BY emotion_label
       ORDER BY count DESC
       LIMIT 1`,
      [req.user.id]
    );

    // Reportes por día (últimos 7 días)
    const reportsByDay = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM emotion_reports
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [req.user.id]
    );

    res.json({
      totalReports: parseInt(totalReports.rows[0].count),
      activeReports: parseInt(activeReports.rows[0].count),
      mostReportedEmotion: mostReportedEmotion.rows[0] || null,
      reportsByDay: reportsByDay.rows
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de usuario:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// HEATMAP DE EMOCIONES
router.get('/heatmap', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        ROUND(latitude::numeric, 3)::float as lat,
        ROUND(longitude::numeric, 3)::float as lng,
        emotion_color,
        COUNT(*) as intensity
       FROM emotion_reports
       WHERE expires_at > NOW()
       GROUP BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3), emotion_color
       ORDER BY intensity DESC`
    );

    res.json({
      count: result.rows.length,
      heatmap: result.rows
    });

  } catch (error) {
    console.error('Error generando heatmap:', error);
    res.status(500).json({ error: 'Error al generar heatmap' });
  }
});

module.exports = router;