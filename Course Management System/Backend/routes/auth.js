import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middlewares/auth.js';

const router = Router();
const run = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const userInfo = user => ({ id: user._id, name: user.name, email: user.email, role: user.role });
const tokenFor = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'development_only_change_me', { expiresIn: '7d' });

router.post('/register', run(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const cleanEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: cleanEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: cleanEmail, password: await bcrypt.hash(password, 12), role: 'student' });
    res.status(201).json({ token: tokenFor(user), user: userInfo(user) });
}));

router.post('/login', run(async (req, res) => {
    const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: userInfo(user) });
}));

router.get('/me', protect, (req, res) => res.json({ user: userInfo(req.user) }));
export default router;
