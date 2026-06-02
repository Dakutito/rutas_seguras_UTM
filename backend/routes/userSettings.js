// backend/routes/userSettings.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// OBTENER CONFIGURACIÓN DE USUARIO
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, profile_photo, created_at, status, role
        FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// ACTUALIZAR NOMBRE
router.patch('/update-name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
    }

    const result = await query(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, profile_photo`,
      [name.trim(), req.user.id]
    );

    res.json({
      message: 'Nombre actualizado correctamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar nombre' });
  }
});

// ELIMINAR CUENTA
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    // Verificar que NO sea admin
    if (req.user.role === 'admin') {
      return res.status(403).json({ error: 'No puedes eliminar la cuenta de administrador' });
    }

    // Eliminar foto si existe
    const photoResult = await query(
      'SELECT profile_photo FROM users WHERE id = $1',
      [req.user.id]
    );

    if (photoResult.rows[0]?.profile_photo) {
      const photoPath = path.join(__dirname, '..', photoResult.rows[0].profile_photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Eliminar usuario (CASCADE eliminará reportes automáticamente)
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});

module.exports = router;