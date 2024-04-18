import jwt from 'jsonwebtoken';

export const generateToken = (obj) => {
    return jwt.sign(obj, process.env.SECRET_KEY, { expiresIn: '24h' });
}

export const validateToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
}