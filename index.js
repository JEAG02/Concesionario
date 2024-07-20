const express = require('express');
const pool = require('./db');
const app = express();
const port = 3000;
app.use(express.json());
require('dotenv').config();

const concesionariosRouter = require('./routes/Concesionario');
const empleadosRouter = require('./routes/Empleado');
const clientesRouter = require('./routes/Cliente');
const almacenesRouter = require('./routes/Almacen');
const insumoRouter = require('./routes/Insumo');
const vehiculoRouter = require('./routes/Vehiculo');
const detalleventaRouter = require('./routes/Detalle_venta');
const ventaRouter = require('./routes/Venta');

app.use('/concesionarios', concesionariosRouter);
app.use('/empleados', empleadosRouter);
app.use('/clientes', clientesRouter);
app.use('/almacenes', almacenesRouter);
app.use('/insumos', insumoRouter);
app.use('/vehiculos', vehiculoRouter);
app.use('/detalleventas', detalleventaRouter);
app.use('/ventas', ventaRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});