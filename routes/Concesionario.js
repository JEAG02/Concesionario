const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try{
        const { nombre, direccion, telefono, email } = req.body;
        const crearConcesionario = await pool.query(
            'INSERT INTO Concesionario (nombre, direccion, telefono, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, direccion, telefono, email]  
        );
        res.json(crearConcesionario.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

router.put('/:id', async (req, res) => {
    const concesionarioId = req.params.id;
    const { nombre, direccion, telefono, email } = req.body;

    try {
        const actualizarConcesionario = await pool.query(
            'UPDATE Concesionario SET nombre = $1, direccion = $2, telefono = $3, email = $4 WHERE id = $5 RETURNING *',
            [nombre, direccion, telefono, email, concesionarioId]
        );

        if (actualizarConcesionario.rows.length === 0) {
            return res.status(404).json({ message: 'Concesionario no encontrado' });
        }

        res.json(actualizarConcesionario.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const concesionarios = await pool.query('SELECT * FROM Concesionario');
        res.json(concesionarios.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    const concesionarioId = req.params.id;

    try {
        const concesionario = await pool.query('SELECT * FROM concesionario WHERE id = $1', [concesionarioId]);
        if (concesionario.rows.length === 0) {
            return res.status(404).json({ message: 'Concesionario no encontrado' });
        }
        res.json(concesionario.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    const concesionarioId = req.params.id;

    try {
        const borrarConcesionario = await pool.query('DELETE FROM Concesionario WHERE id = $1 RETURNING *', [concesionarioId]);

        if (borrarConcesionario.rows.length === 0) {
            return res.status(404).json({ message: 'Concesionario no encontrado' });
        }

        res.json({ message: 'Concesionario eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;