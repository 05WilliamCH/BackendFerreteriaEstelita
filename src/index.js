const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarios.routes');
const proveedorRoutes = require('./routes/proveedores.routes');
const clienteRoutes = require('./routes/clientes.routes');
const categoriaRoutes = require('./routes/categorias.routes');
const devolucionesRoutes = require('./routes/devoluciones.routes');

const productoRoutes = require('./routes/producto.routes');
const compraRoutes = require('./routes/compra.routes');

const ventaRoutes = require('./routes/ventas.routes');

const reporteRoutes = require('./routes/reportes.routes');

const reportecompraRoutes = require('./routes/reportecompras.routes');
const reporteventaRoutes = require('./routes/reporteventas.routes');

const cajaRoutes = require('./routes/caja.routes');

const dashboardRoutes = require('./routes/dashboard.routes');

const kardexRoutes = require('./routes/kardex.routes');

const inventarioRoutes = require('./routes/invdashboard.routes');

const ventaDetalleRoutes = require('./routes/ventaDetalle.route');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/devoluciones', devolucionesRoutes);

app.use('/api/productos', productoRoutes);
app.use('/api/compras', compraRoutes);

app.use('/api/ventas', ventaRoutes);

app.use('/api/reportes', reporteRoutes);

app.use('/api/reportecompras', reportecompraRoutes);
app.use('/api/reporteventas', reporteventaRoutes);
app.use('/api/caja', cajaRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/kardex', kardexRoutes);

app.use('/api/inventario', inventarioRoutes);

app.use('/api/ventas', ventaDetalleRoutes);


// Servidor
app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
