const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try {
        const { tipo_producto, cantidad, id_venta, id_producto } = req.body;
        let precio_unitario = 0;
        let nombre_producto = '';

        if (tipo_producto === 'insumo') {
            const insumoQuery = 'SELECT precio, nombre FROM Insumo WHERE id = $1';
            const insumoResult = await pool.query(insumoQuery, [id_producto]);
            if (insumoResult.rows.length > 0) {
                precio_unitario = insumoResult.rows[0].precio;
                nombre_producto = insumoResult.rows[0].nombre;
            }
        } else if (tipo_producto === 'vehiculo') {
            const vehiculoQuery = 'SELECT precio, marca FROM Vehiculo WHERE id = $1';
            const vehiculoResult = await pool.query(vehiculoQuery, [id_producto]);
            if (vehiculoResult.rows.length > 0) {
                precio_unitario = vehiculoResult.rows[0].precio;
                nombre_producto = vehiculoResult.rows[0].marca;
            }
        } else {
            return res.status(400).json({ message: 'Tipo de producto no válido' });
        }

        const precio_total = cantidad * precio_unitario;

        const crearDetalleVenta = await pool.query(
            'INSERT INTO Detalle_venta (tipo_producto, cantidad, precio_unitario, precio_total, id_venta, id_producto, nombre_producto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [tipo_producto, cantidad, precio_unitario, precio_total, id_venta, id_producto, nombre_producto]
        );

        res.json(crearDetalleVenta.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', async (req, res) => {
    const detalleVentaId = req.params.id;
    const { tipo_producto, cantidad, id_venta, id_producto } = req.body;
    let precio_unitario = 0;
    let nombre_producto = '';

    if (tipo_producto === 'insumo') {
        const insumoQuery = 'SELECT precio, nombre FROM Insumo WHERE id = $1';
        const insumoResult = await pool.query(insumoQuery, [id_producto]);
        if (insumoResult.rows.length > 0) {
            precio_unitario = insumoResult.rows[0].precio;
            nombre_producto = insumoResult.rows[0].nombre;
        }
    } else if (tipo_producto === 'vehiculo') {
        const vehiculoQuery = 'SELECT precio, marca FROM Vehiculo WHERE id = $1';
        const vehiculoResult = await pool.query(vehiculoQuery, [id_producto]);
        if (vehiculoResult.rows.length > 0) {
            precio_unitario = vehiculoResult.rows[0].precio;
            nombre_producto = vehiculoResult.rows[0].marca;
        }
    } else {
        return res.status(400).json({ message: 'Tipo de producto no válido' });
    }

    const precio_total = cantidad * precio_unitario;

    try {
        const actualizarDetalleventa = await pool.query(
            'UPDATE Detalle_venta SET tipo_producto = $1, cantidad = $2, precio_unitario = $3, precio_total = $4, id_venta = $5, id_producto = $6, nombre_producto = $7 WHERE id = $8 RETURNING *',
            [tipo_producto, cantidad, precio_unitario, precio_total, id_venta, id_producto, nombre_producto, detalleVentaId]
        );

        if (actualizarDetalleventa.rows.length === 0) {
            return res.status(404).json({ message: 'Detalle no encontrado' });
        }

        res.json(actualizarDetalleventa.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const detalleventas = await pool.query('SELECT * FROM Detalle_venta');
        res.json(detalleventas.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    const detalleVentaId = req.params.id;

    try {
        const detalleVenta = await pool.query('SELECT * FROM detalle_venta WHERE id = $1', [detalleVentaId]);
        if (detalleVenta.rows.length === 0) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }
        res.json(detalleVenta.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    const detalleventaId = req.params.id;

    try {
        const borrarDetalleventa = await pool.query('DELETE FROM Detalle_venta WHERE id = $1 RETURNING *', [detalleventaId]);

        if (borrarDetalleventa.rows.length === 0) {
            return res.status(404).json({ message: 'Detalle no encontrado' });
        }

        res.json({ message: 'Detalle eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
