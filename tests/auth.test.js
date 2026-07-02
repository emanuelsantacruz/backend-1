import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';

// Configurar entorno de pruebas para MongoDB
process.env.PERSISTENCE = 'MONGO';
process.env.PORT = '0'; // Puerto dinámico libre
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_test';

// Importar dinámicamente para aplicar variables de entorno
const { httpServer } = await import('../src/app.js');
const { userModel } = await import('../src/models/user.model.js');
const { cartModel } = await import('../src/models/cart.model.js');

test.describe('Pruebas de Integración - Sistema de Autenticación Híbrido', () => {
    let baseUrl;
    let testUserToken;
    let testAdminToken;

    test.before(async () => {
        const address = httpServer.address();
        baseUrl = `http://localhost:${address.port}`;

        // Limpiar colecciones de prueba si estamos conectados
        if (mongoose.connection.readyState === 1) {
            await userModel.deleteMany({});
            await cartModel.deleteMany({});
        }
    });

    test.after(async () => {
        // Cerrar conexiones del servidor y base de datos
        httpServer.close();
        if (mongoose.connection.readyState !== 0) {
            await userModel.deleteMany({});
            await cartModel.deleteMany({});
            await mongoose.connection.close();
        }
    });

    test.describe('Registro de Usuario (POST /api/v1/auth/register)', () => {
        test('Debería registrar un nuevo usuario con éxito y hash de contraseña', async () => {
            const userData = {
                first_name: 'Emanuel',
                last_name: 'Santa Cruz',
                email: 'emanuel_test@example.com',
                age: 28,
                password: 'password123',
                role: 'user'
            };

            const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            assert.strictEqual(response.status, 201);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.strictEqual(data.payload.email, userData.email);
            assert.strictEqual(data.payload.role, 'user');
            assert.ok(data.payload.id);

            // Verificar en la BD que la contraseña esté cifrada (hash)
            const dbUser = await userModel.findOne({ email: userData.email });
            assert.ok(dbUser);
            assert.notStrictEqual(dbUser.password, userData.password); // Contraseña hash
            assert.ok(dbUser.password.startsWith('$2b$')); // Prefijo estándar de bcrypt
        });

        test('Debería denegar el registro si el correo electrónico ya está duplicado', async () => {
            const duplicateUser = {
                first_name: 'Duplicado',
                last_name: 'Test',
                email: 'emanuel_test@example.com', // ya registrado en la prueba anterior
                age: 30,
                password: 'password123'
            };

            const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duplicateUser)
            });

            assert.strictEqual(response.status, 400);
            const data = await response.json();
            assert.strictEqual(data.status, 'error');
            assert.strictEqual(data.error, 'El correo electrónico ya está registrado.');
        });
    });

    test.describe('Inicio de Sesión Local (POST /api/v1/auth/login)', () => {
        test('Debería iniciar sesión con credenciales correctas y emitir JWT + Cookie', async () => {
            const loginCredentials = {
                email: 'emanuel_test@example.com',
                password: 'password123'
            };

            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginCredentials)
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.ok(data.token); // JWT en el body

            testUserToken = data.token; // guardar token para rutas protegidas

            // Verificar cabecera de Cookie Set-Cookie
            const cookieHeader = response.headers.get('set-cookie');
            assert.ok(cookieHeader);
            assert.ok(cookieHeader.includes('authToken='));
            assert.ok(cookieHeader.includes('HttpOnly'));
            assert.ok(cookieHeader.includes('SameSite=Lax'));
        });

        test('Debería retornar 401 para credenciales inválidas', async () => {
            const badCredentials = {
                email: 'emanuel_test@example.com',
                password: 'password_incorrecta'
            };

            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(badCredentials)
            });

            assert.strictEqual(response.status, 401);
            const data = await response.json();
            assert.strictEqual(data.status, 'error');
            assert.strictEqual(data.error, 'Contraseña incorrecta');
        });
    });

    test.describe('Acceso a Rutas Protegidas', () => {
        test('GET /api/v1/profile debería permitir acceso con token JWT válido', async () => {
            const response = await fetch(`${baseUrl}/api/v1/profile`, {
                headers: { 'Authorization': `Bearer ${testUserToken}` }
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.strictEqual(data.user.role, 'user');
        });

        test('GET /api/v1/profile debería denegar acceso (401) si falta el token', async () => {
            const response = await fetch(`${baseUrl}/api/v1/profile`);
            assert.strictEqual(response.status, 401);
            const data = await response.json();
            assert.strictEqual(data.status, 'error');
            assert.strictEqual(data.error, 'Acceso denegado. Falta autenticación.');
        });

        test('GET /api/v1/admin debería denegar acceso (403) a un usuario con rol "user"', async () => {
            const response = await fetch(`${baseUrl}/api/v1/admin`, {
                headers: { 'Authorization': `Bearer ${testUserToken}` }
            });

            assert.strictEqual(response.status, 403);
            const data = await response.json();
            assert.strictEqual(data.status, 'error');
            assert.strictEqual(data.error, 'Acceso denegado. Permisos insuficientes.');
        });

        test('GET /api/v1/admin debería permitir acceso a un usuario con rol "admin"', async () => {
            // Registrar usuario administrador
            await userModel.create({
                first_name: 'Admin',
                last_name: 'Test',
                email: 'admin_test@example.com',
                age: 35,
                password: 'adminpassword',
                role: 'admin'
            });

            // Login de administrador
            const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin_test@example.com', password: 'adminpassword' })
            });
            const loginData = await loginResponse.json();
            testAdminToken = loginData.token;

            // Petición a ruta administrativa
            const response = await fetch(`${baseUrl}/api/v1/admin`, {
                headers: { 'Authorization': `Bearer ${testAdminToken}` }
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');
            assert.ok(data.adminData);
        });
    });

    test.describe('Cierre de Sesión (POST /api/v1/auth/logout)', () => {
        test('Debería cerrar sesión, destruyendo cookies de token', async () => {
            const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${testUserToken}` }
            });

            assert.strictEqual(response.status, 200);
            const data = await response.json();
            assert.strictEqual(data.status, 'success');

            // Verificar la expiración forzada de la cookie
            const cookieHeader = response.headers.get('set-cookie');
            assert.ok(cookieHeader);
            assert.ok(cookieHeader.includes('Max-Age=0') || cookieHeader.includes('expires='));
        });
    });
});
