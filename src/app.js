import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManagerMongo from './dao/mongo/ProductManagerMongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a la base de Mongo!'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);


const httpServer = app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto ${PORT}`);
});


const io = new Server(httpServer);
app.set('socketio', io);

const productManager = new ProductManagerMongo();

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado al socket:', socket.id);


    socket.emit('productsUpdate', await productManager.getProducts(100, 1));

    socket.on('addProduct', async (productData) => {
        try {
            await productManager.addProduct(productData);
            io.emit('productsUpdate', await productManager.getProducts(100, 1));
        } catch (error) {
            console.error('Error al agregar el producto por socket:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            io.emit('productsUpdate', await productManager.getProducts(100, 1));
        } catch (error) {
            console.error('Error borrando producto por socket:', error);
        }
    });
});
