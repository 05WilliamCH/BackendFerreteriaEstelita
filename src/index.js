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

const compraDetalleRoutes = require('./routes/compraDetalle.routes');

const devolucionCompraRoutes = require('./routes/devolucioncompra.routes');
const devolucionVentaRoutes = require('./routes/devolucionventa.routes');
const reportedevolucionesRoutes = require('./routes/reportedevoluciones.routes');  

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

app.use('/api/compras', compraDetalleRoutes);

app.use('/api/devolucioncompra', devolucionCompraRoutes);
app.use('/api/devolucionventa', devolucionVentaRoutes);
app.use('/api/reportedevoluciones', reportedevolucionesRoutes);


// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
