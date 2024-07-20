const express = require('express');
const router = express.Router();
const pool = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Correo enviado: ' + info.response);
    });
};

router.post('/', async (req, res) => {
    try {
        const { fecha, dni_empleado, dni_cliente } = req.body;

        await pool.query('BEGIN');

        const crearVenta = await pool.query(
            'INSERT INTO Venta (fecha, dni_empleado, dni_cliente) VALUES ($1, $2, $3) RETURNING id',
            [fecha, dni_empleado, dni_cliente]
        );
        const ventaId = crearVenta.rows[0].id;

        const clienteResult = await pool.query(
            'SELECT email FROM Cliente WHERE dni = $1',
            [dni_cliente]
        );
        const clienteEmail = clienteResult.rows[0].email;

        const empleadoResult = await pool.query(
            'SELECT email FROM Empleado WHERE dni = $1',
            [dni_empleado]
        );
        const empleadoEmail = empleadoResult.rows[0].email;

        const concesionarioResult = await pool.query(
            'SELECT email FROM Concesionario WHERE id = (SELECT id_concesionario FROM Empleado WHERE dni = $1)',
            [dni_empleado]
        );
        const concesionarioEmail = concesionarioResult.rows[0].email;

        const calcularPrecioTotalQuery = `
            SELECT SUM(precio_total) AS total FROM Detalle_venta WHERE id_venta = $1
        `;
        const calcularPrecioTotalResult = await pool.query(calcularPrecioTotalQuery, [ventaId]);
        const precio_total = calcularPrecioTotalResult.rows[0].total || 0;

        await pool.query(
            'UPDATE Venta SET precio_total = $1 WHERE id = $2',
            [precio_total, ventaId]
        );

        await pool.query('COMMIT');

        const subjectCliente = 'Confirmación de compra';
        const textCliente = `Gracias por su compra. El Id de su venta es ${ventaId}.`;
        const subjectEmpleado = 'Confirmación de venta';
        const textEmpleado = `La venta con Id ${ventaId} ha sido confirmada.`;
        const subjectConcesionario = 'Confirmación de venta';
        const textConcesionario = `La venta con Id ${ventaId} ha sido confirmada y realizada por el empleado con Id ${dni_empleado}.`;
        
        sendEmail(clienteEmail, subjectCliente, textCliente);
        sendEmail(empleadoEmail, subjectEmpleado, textEmpleado);
        sendEmail(concesionarioEmail, subjectConcesionario, textConcesionario);

        res.json({ id: ventaId, precio_total: precio_total });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

router.put('/:id', async (req, res) => {
    const ventaId = req.params.id;
    const { fecha, dni_empleado, dni_cliente, precio_total } = req.body;

    try {
        const ventaExistente = await pool.query('SELECT * FROM Venta WHERE id = $1', [ventaId]);
        if (ventaExistente.rows.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const empleadoExistente = await pool.query('SELECT * FROM Empleado WHERE dni = $1', [dni_empleado]);
        if (empleadoExistente.rows.length === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        const clienteExistente = await pool.query('SELECT * FROM Cliente WHERE dni = $1', [dni_cliente]);
        if (clienteExistente.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const actualizarVenta = await pool.query(
            'UPDATE Venta SET fecha = $1, dni_empleado = $2, dni_cliente = $3, precio_total = $4 WHERE id = $5 RETURNING *',
            [fecha, dni_empleado, dni_cliente, precio_total, ventaId]
        );

        res.json(actualizarVenta.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

router.get('/', async (req, res) => {
    try {
        const ventas = await pool.query('SELECT * FROM Venta');
        res.json(ventas.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    const ventaId = req.params.id;

    try {
        const venta = await pool.query('SELECT * FROM venta WHERE id = $1', [ventaId]);
        if (venta.rows.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(venta.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    const ventaId = req.params.id;

    try {
        await pool.query('BEGIN');

        // Eliminar los detalles de la venta
        const borrarDetalleVenta = await pool.query('DELETE FROM Detalle_venta WHERE id_venta = $1 RETURNING *', [ventaId]);

        // Eliminar la venta
        const borrarVenta = await pool.query('DELETE FROM Venta WHERE id = $1 RETURNING *', [ventaId]);

        await pool.query('COMMIT');

        if (borrarVenta.rows.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.json({ message: 'Venta eliminada' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
