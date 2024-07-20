const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try{
        const { nombre, direccion, telefono_cliente, email, id_concesionario } = req.body;
        const crearCliente = await pool.query(
            'INSERT INTO Cliente (nombre, direccion, telefono_cliente, email, id_concesionario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, direccion, telefono_cliente, email, id_concesionario]  
        );
        res.json(crearCliente.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

router.put('/:dni', async (req, res) => {
    const clienteDni = req.params.dni;
    const { nombre, direccion, telefono_cliente, email, id_concesionario } = req.body;

    try {
        const actualizarCliente = await pool.query(
            'UPDATE Cliente SET nombre = $1, direccion = $2, telefono_cliente = $3, email = $4, id_concesionario = $5 WHERE dni = $6 RETURNING *',
            [nombre, direccion, telefono_cliente, email, id_concesionario, clienteDni]
        );

        if (actualizarCliente.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json(actualizarCliente.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const clientes = await pool.query('SELECT * FROM Cliente');
        res.json(clientes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:dni', async (req, res) => {
    const clienteDni = req.params.dni;

    try {
        const cliente = await pool.query('SELECT * FROM cliente WHERE dni = $1', [clienteDni]);
        if (cliente.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(cliente.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:dni', async (req, res) => {
    const clienteDni = req.params.dni;

    try {
        const borrarCliente = await pool.query('DELETE FROM Cliente WHERE dni = $1 RETURNING *', [clienteDni]);

        if (borrarCliente.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;