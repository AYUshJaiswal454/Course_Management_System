import { Router } from 'express';
import Course from '../models/Course.js';
import { protect, allowRoles } from '../middlewares/auth.js';

const router = Router();
const run = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const courseInfo = query => query.populate('instructor', 'name email');

router.get('/', run(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.$or = ['title', 'code', 'category'].map(key => ({ [key]: { $regex: req.query.search, $options: 'i' } }));
  if (req.query.active === 'true') filter.active = true;
  res.json({ courses: await courseInfo(Course.find(filter)).sort({ createdAt: -1 }) });
}));

router.get('/:id', run(async (req, res) => {
  const course = await courseInfo(Course.findById(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  res.json({ course });
}));

router.post('/', protect, allowRoles('admin'), run(async (req, res) => {
  const { title, code } = req.body;
  if (!title?.trim() || !code?.trim()) return res.status(400).json({ message: 'Course title and code are required.' });
  res.status(201).json({ course: await Course.create(req.body) });
}));

router.put('/:id', protect, allowRoles('admin'), run(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  res.json({ course });
}));

router.delete('/:id', protect, allowRoles('admin'), run(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  res.json({ message: 'Course deleted.' });
}));

export default router;
