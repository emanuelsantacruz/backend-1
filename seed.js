import 'dotenv/config';
import mongoose from 'mongoose';
import { productModel } from './src/models/product.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

const products = [
    { title: "Club de Nuit EDT", description: "Un clásico moderno con notas cítricas, madera y un fondo ahumado intenso.", code: "PERF002", price: 40000, status: true, stock: 10, category: "Hombre", thumbnails: ["/img/clubdenuit.jpg"] },
    { title: "Animale men EDT", description: "Fragancia audaz y sofisticada con notas de menta, cítricos y lavanda.", code: "PERF003", price: 40000, status: true, stock: 10, category: "Hombre", thumbnails: ["/img/animale.jpg"] },
    { title: "Honor and Glory", description: "Aroma oriental especiado con oud, ideal para quienes buscan intensidad.", code: "PERF004", price: 60000, status: true, stock: 10, category: "Unisex", thumbnails: ["/img/badeealoud.jpg"] },
    { title: "Emper Stallion", description: "Una fragancia potente y masculina con toques amaderados y especiados.", code: "PERF005", price: 40000, status: true, stock: 10, category: "Hombre", thumbnails: ["/img/emperstallion.jpg"] },
    { title: "Versace Eros Flame", description: "Pasión y fuerza en una botella. Notas de chinotto, limón y pimienta negra.", code: "PERF006", price: 90000, status: true, stock: 10, category: "Hombre", thumbnails: ["/img/versaceflame.jpg"] }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a Mongo. Limpiando productos existentes...');
        await productModel.deleteMany({});
        console.log('Productos borrados. Insertando 15 nuevos productos realistas...');
        await productModel.insertMany(products);
        console.log('¡Productos agregados con éxito!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
seed();
