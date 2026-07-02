import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller.js';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/api/v1/auth/register', authController.registerUser);
router.post('/api/v1/auth/login', authController.loginUser);

router.get('/api/v1/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/api/v1/auth/githubcallback', 
    passport.authenticate('github', { failureRedirect: '/login', session: true }), 
    (req, res) => {
        res.redirect('/products');
    }
);

router.post('/api/v1/auth/logout', authController.logoutUser);
router.get('/api/v1/auth/logout', authController.logoutUser);

router.get('/api/v1/session', authController.getSession);

router.get('/api/v1/profile', authenticateJWT, (req, res) => {
    res.json({
        status: 'success',
        message: 'Acceso concedido al perfil de usuario.',
        user: req.user
    });
});

router.get('/api/v1/admin', authenticateJWT, authorizeRole('admin'), (req, res) => {
    res.json({
        status: 'success',
        message: 'Acceso concedido a la consola de administración.',
        adminData: {
            logs: 'Acciones de administración sensibles y auditoría en curso.'
        }
    });
});

export default router;

