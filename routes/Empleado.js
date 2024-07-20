const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try{
        const { nombre, salario, telefono, email, id_concesionario } = req.body;
        const crearEmpleado = await pool.query(
            'INSERT INTO Empleado (nombre, salario, telefono, email, id_concesionario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, salario, telefono, email, id_concesionario]  
        );
        res.json(crearEmpleado.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

router.put('/:dni', async (req, res) => {
    const empleadoDni = req.params.dni;
    const { nombre, salario, telefono, email, id_concesionario } = req.body;

    try {
        const actualizarEmpleado = await pool.query(
            'UPDATE Empleado SET nombre = $1, salario = $2, telefono = $3, email = $4, id_concesionario = $5 WHERE dni = $6 RETURNING *',
            [nombre, salario, telefono, email, id_concesionario, empleadoDni]
        );

        if (actualizarEmpleado.rows.length === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.json(actualizarEmpleado.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const empleados = await pool.query('SELECT * FROM Empleado');
        res.json(empleados.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:dni', async (req, res) => {
    const empleadoDni = req.params.dni;

    try {
        const empleado = await pool.query('SELECT * FROM empleado WHERE dni = $1', [empleadoDni]);
        if (empleado.rows.length === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.json(empleado.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:dni', async (req, res) => {
    const empleadoDni = req.params.dni;

    try {
        const borrarEmpleado = await pool.query('DELETE FROM Empleado WHERE dni = $1 RETURNING *', [empleadoDni]);

        if (borrarEmpleado.rows.length === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.json({ message: 'Empleado eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;