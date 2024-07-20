const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try{
        const { marca, modelo, precio, id_concesionario } = req.body;
        const crearVehiculo = await pool.query(
            'INSERT INTO Vehiculo (marca, modelo, precio, id_concesionario) VALUES ($1, $2, $3, $4) RETURNING *',
            [marca, modelo, precio, id_concesionario]  
        );
        res.json(crearVehiculo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

router.put('/:id', async (req, res) => {
    const vehiculoId = req.params.id;
    const { marca, modelo, precio, id_concesionario } = req.body;

    try {
        const actualizarVehiculo = await pool.query(
            'UPDATE Vehiculo SET marca = $1, modelo = $2, precio = $3, id_concesionario = $4 WHERE id = $5 RETURNING *',
            [marca, modelo, precio, id_concesionario, vehiculoId]
        );

        if (actualizarVehiculo.rows.length === 0) {
            return res.status(404).json({ message: 'Vehiculo no encontrado' });
        }

        res.json(actualizarVehiculo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const vehiculos = await pool.query('SELECT * FROM Vehiculo');
        res.json(vehiculos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    const vehiculoId = req.params.id;

    try {
        const vehiculo = await pool.query('SELECT * FROM vehiculo WHERE id = $1', [vehiculoId]);
        if (vehiculo.rows.length === 0) {
            return res.status(404).json({ message: 'Vehiculo no encontrado' });
        }
        res.json(vehiculo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    const vehiculoId = req.params.id;

    try {
        const borrarVehiculo = await pool.query('DELETE FROM Vehiculo WHERE id = $1 RETURNING *', [vehiculoId]);

        if (borrarVehiculo.rows.length === 0) {
            return res.status(404).json({ message: 'Vehiculo no encontrado' });
        }

        res.json({ message: 'Vehiculo eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;