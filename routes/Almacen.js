const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try{
        const { nombre, ubicacion, telefono } = req.body;
        const crearAlmacen = await pool.query(
            'INSERT INTO Almacen (nombre, ubicacion, telefono) VALUES ($1, $2, $3) RETURNING *',
            [nombre, ubicacion, telefono]  
        );
        res.json(crearAlmacen.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

router.put('/:id', async (req, res) => {
    const almacenId = req.params.id;
    const { nombre, ubicacion, telefono } = req.body;

    try {
        const actualizarAlmacen = await pool.query(
            'UPDATE Almacen SET nombre = $1, ubicacion = $2, telefono = $3 WHERE id = $4 RETURNING *',
            [nombre, ubicacion, telefono, almacenId]
        );

        if (actualizarAlmacen.rows.length === 0) {
            return res.status(404).json({ message: 'Almace no encontrado' });
        }

        res.json(actualizarAlmacen.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const almacenes = await pool.query('SELECT * FROM Almacen');
        res.json(almacenes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    const almacenId = req.params.id;

    try {
        const almacen = await pool.query('SELECT * FROM almacen WHERE id = $1', [almacenId]);
        if (almacen.rows.length === 0) {
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }
        res.json(almacen.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    const almacenId = req.params.id;

    try {
        const borrarAlmacen = await pool.query('DELETE FROM Almacen WHERE id = $1 RETURNING *', [almacenId]);

        if (borrarAlmacen.rows.length === 0) {
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }

        res.json({ message: 'Almacen eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;