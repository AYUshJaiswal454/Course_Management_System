import { Router } from 'express';
import Batch from '../models/Batch.js';
import Enrollment from '../models/Enrollment.js';
import { protect, allowRoles } from '../middlewares/auth.js';

const router = Router();
const run = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

router.get('/', run(async (_req, res) => {
  const [batches, counts] = await Promise.all([
    Batch.find().populate('course', 'title code category').populate('instructor', 'name email').sort({ startDate: 1 }),
    Enrollment.aggregate([{ $match: { status: 'enrolled' } }, { $group: { _id: '$batch', count: { $sum: 1 } } }])
  ]);
  const countByBatch = Object.fromEntries(counts.map(item => [String(item._id), item.count]));
  res.json({ batches: batches.map(batch => ({ ...batch.toObject(), enrolledCount: countByBatch[String(batch._id)] || 0 })) });
}));

router.post('/', protect, allowRoles('admin'), run(async (req, res) => {
  const { name, course, startDate, endDate, schedule, capacity } = req.body;
  if (!name || !course || !startDate || !endDate || !schedule || !capacity) return res.status(400).json({ message: 'Please complete all required batch fields.' });
  if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ message: 'End date must be after start date.' });
  res.status(201).json({ batch: await Batch.create(req.body) });
}));

router.put('/:id', protect, allowRoles('admin'), run(async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!batch) return res.status(404).json({ message: 'Batch not found.' });
  res.json({ batch });
}));

router.delete('/:id', protect, allowRoles('admin'), run(async (req, res) => {
  if (await Enrollment.countDocuments({ batch: req.params.id, status: 'enrolled' })) return res.status(409).json({ message: 'This batch has enrolled students. Cancel their enrollments before deleting it.' });
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) return res.status(404).json({ message: 'Batch not found.' });
  res.json({ message: 'Batch deleted.' });
}));

export default router;
