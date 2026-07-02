import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
    let token = null;

    if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'error', error: 'Acceso denegado. Falta autenticación.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKeyJWT');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', error: 'Token no válido o expirado.' });
    }
};

export const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', error: 'No autenticado.' });
        }
        
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ status: 'error', error: 'Acceso denegado. Permisos insuficientes.' });
        }
        
        next();
    };
};
