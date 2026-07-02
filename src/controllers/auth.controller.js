import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model.js';
import { cartModel } from '../models/cart.model.js';

export const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, role } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ status: 'error', error: 'El correo electrónico ya está registrado.' });
        }

        const newCart = await cartModel.create({ products: [] });

        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age: parseInt(age, 10),
            password,
            cart: newCart._id,
            role: role || 'user'
        });

        return res.status(201).json({
            status: 'success',
            payload: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', error: error.message });
    }
};

export const loginUser = (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ status: 'error', error: info.message || 'No autorizado' });
        }

        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretKeyJWT', {
            expiresIn: '1h'
        });

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: 'Lax',
            secure: isProduction,
            maxAge: 3600000
        });

        return res.status(200).json({
            status: 'success',
            token,
            payload: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    })(req, res, next);
};

export const logoutUser = (req, res) => {
    res.clearCookie('authToken');
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ status: 'error', error: 'No se pudo cerrar la sesión correctamente.' });
            }
            return res.status(200).json({ status: 'success', message: 'Sesión destruida y cookies eliminadas con éxito.' });
        });
    } else {
        return res.status(200).json({ status: 'success', message: 'Cookies eliminadas con éxito.' });
    }
};

export const getSession = (req, res) => {
    if (req.session && req.session.passport) {
        return res.json({
            status: 'success',
            session: {
                userId: req.session.passport.user,
                isActive: true
            }
        });
    }
    return res.status(401).json({ status: 'error', message: 'No hay ninguna sesión activa.' });
};
