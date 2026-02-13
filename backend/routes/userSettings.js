// backend/routes/userSettings.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para subir fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
});

// OBTENER CONFIGURACIÓN DE USUARIO
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, profile_photo, created_at 
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

// SUBIR/ACTUALIZAR FOTO DE PERFIL
router.post('/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }
    
    // Obtener foto antigua para eliminarla
    const oldPhoto = await query(
      'SELECT profile_photo FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Actualizar en BD
    await query(
      'UPDATE users SET profile_photo = $1 WHERE id = $2',
      [photoUrl, req.user.id]
    );
    
    // Eliminar foto antigua si existe
    if (oldPhoto.rows[0]?.profile_photo) {
      const oldPath = path.join(__dirname, '..', oldPhoto.rows[0].profile_photo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    res.json({
      message: 'Foto de perfil actualizada',
      photoUrl
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al subir foto' });
  }
});

// ELIMINAR FOTO DE PERFIL
router.delete('/delete-photo', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT profile_photo FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const photoPath = result.rows[0]?.profile_photo;
    
    if (photoPath) {
      const fullPath = path.join(__dirname, '..', photoPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    // Actualizar BD
    await query(
      'UPDATE users SET profile_photo = NULL WHERE id = $1',
      [req.user.id]
    );
    
    res.json({ message: 'Foto de perfil eliminada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar foto' });
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