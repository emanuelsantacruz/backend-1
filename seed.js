import 'dotenv/config';
import mongoose from 'mongoose';
import { productModel } from './src/models/product.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

const products = [
    { title: "Laptop Gamer X", description: "Potente laptop para gaming con RTX 4060", code: "LAP001", price: 1200, status: true, stock: 15, category: "Electronica", thumbnails: [] },
    { title: "Auriculares Inalámbricos", description: "Auriculares bluetooth con cancelación de ruido", code: "AUD001", price: 150, status: true, stock: 50, category: "Accesorios", thumbnails: [] },
    { title: "Teclado Mecánico RGB", description: "Teclado mecánico switches red", code: "TEC001", price: 80, status: true, stock: 30, category: "Perifericos", thumbnails: [] },
    { title: "Monitor UltraWide 34\"", description: "Monitor 144hz 1ms para trabajo y juegos", code: "MON001", price: 400, status: true, stock: 10, category: "Monitores", thumbnails: [] },
    { title: "Silla Gamer Pro", description: "Silla ergonómica de cuero sintético", code: "SIL001", price: 250, status: true, stock: 20, category: "Mobiliario", thumbnails: [] },
    { title: "Mouse Inalámbrico", description: "Mouse ergonómico de precisión", code: "MOU001", price: 45, status: true, stock: 100, category: "Perifericos", thumbnails: [] },
    { title: "Cámara Web HD", description: "Cámara web 1080p con micrófono integrado", code: "CAM001", price: 60, status: true, stock: 40, category: "Perifericos", thumbnails: [] },
    { title: "Disco Duro Externo 2TB", description: "Almacenamiento portátil HDD", code: "DIS001", price: 85, status: true, stock: 60, category: "Almacenamiento", thumbnails: [] },
    { title: "Memoria RAM 16GB", description: "DDR4 3200MHz RGB", code: "RAM001", price: 70, status: true, stock: 80, category: "Componentes", thumbnails: [] },
    { title: "Procesador i7", description: "Intel Core i7 12va Generación", code: "PRO001", price: 350, status: true, stock: 25, category: "Componentes", thumbnails: [] },
    { title: "Placa Madre ATX", description: "Motherboard Z690 con WiFi", code: "PLA001", price: 200, status: true, stock: 15, category: "Componentes", thumbnails: [] },
    { title: "Fuente de Poder 750W", description: "Certificación 80 Plus Gold", code: "FUE001", price: 100, status: true, stock: 35, category: "Componentes", thumbnails: [] },
    { title: "Gabinete PC", description: "Gabinete Mid Tower con 4 ventiladores", code: "GAB001", price: 90, status: true, stock: 18, category: "Componentes", thumbnails: [] },
    { title: "Micrófono de Condensador", description: "Ideal para streaming y podcasts", code: "MIC001", price: 110, status: true, stock: 22, category: "Accesorios", thumbnails: [] },
    { title: "Hub USB-C", description: "Hub con HDMI, Ethernet y USB 3.0", code: "HUB001", price: 30, status: true, stock: 150, category: "Accesorios", thumbnails: [] },
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
