import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import { userModel } from '../models/user.model.js';
import { cartModel } from '../models/cart.model.js';

const LocalStrategy = local.Strategy;

export const initializePassport = () => {
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
                const isValid = await user.isValidPassword(password);
                if (!isValid) {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('github', new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
            callbackURL: 'http://localhost:8080/api/v1/auth/githubcallback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `${profile.username || profile.id}@github.com`;
                let user = await userModel.findOne({ email });

                if (!user) {
                    const newCart = await cartModel.create({ products: [] });
                    const displayName = profile.displayName || profile.username || 'GitHub User';
                    const nameParts = displayName.split(' ');
                    const first_name = nameParts[0];
                    const last_name = nameParts.slice(1).join(' ') || 'OAuth';

                    user = await userModel.create({
                        first_name,
                        last_name,
                        email,
                        age: 18,
                        password: 'none',
                        cart: newCart._id,
                        role: 'user'
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};
