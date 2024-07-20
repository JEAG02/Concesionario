const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try{
        const { nombre, descripcion, precio, id_almacen } = req.body;
        const crearInsumo = await pool.query(
            'INSERT INTO Insumo (nombre, descripcion, precio, id_almacen) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, precio, id_almacen]  
        );
        res.json(crearInsumo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

router.put('/:id', async (req, res) => {
    const insumoId = req.params.id;
    const { nombre, descripcion, precio, id_almacen } = req.body;

    try {
        const actualizarInsumo = await pool.query(
            'UPDATE Insumo SET nombre = $1, descripcion = $2, precio = $3, id_almacen = $4 WHERE id = $5 RETURNING *',
            [nombre, descripcion, precio, id_almacen, insumoId]
        );

        if (actualizarInsumo.rows.length === 0) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        res.json(actualizarInsumo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const insumos = await pool.query('SELECT * FROM Insumo');
        res.json(insumos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    const insumoId = req.params.id;

    try {
        const insumo = await pool.query('SELECT * FROM insumo WHERE id = $1', [insumoId]);
        if (insumo.rows.length === 0) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }
        res.json(insumo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    const insumoId = req.params.id;

    try {
        const borrarInsumo = await pool.query('DELETE FROM Insumo WHERE id = $1 RETURNING *', [insumoId]);

        if (borrarInsumo.rows.length === 0) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        res.json({ message: 'Insumo eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;