import { Router } from 'express';
import Enrollment from '../models/Enrollment.js';
import Batch from '../models/Batch.js';
import { protect, allowRoles } from '../middlewares/auth.js';

const router = Router();
const run = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const batchDetails = { path: 'batch', populate: [{ path: 'course', select: 'title code category' }, { path: 'instructor', select: 'name' }] };

router.get('/mine', protect, allowRoles('student'), run(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate(batchDetails).sort({ createdAt: -1 });
  res.json({ enrollments });
}));

router.get('/', protect, allowRoles('admin'), run(async (_req, res) => {
  const enrollments = await Enrollment.find().populate('student', 'name email')
    .populate({ path: 'batch', populate: { path: 'course', select: 'title code' } }).sort({ createdAt: -1 });
  res.json({ enrollments });
}));

router.post('/:batchId', protect, allowRoles('student'), run(async (req, res) => {
  const batch = await Batch.findById(req.params.batchId);
  if (!batch) return res.status(404).json({ message: 'Batch not found.' });
  if (batch.status !== 'open') return res.status(400).json({ message: 'This batch is not currently open for enrollment.' });
  const old = await Enrollment.findOne({ student: req.user._id, batch: batch._id });
  if (old?.status === 'enrolled') return res.status(409).json({ message: 'You are already enrolled in this batch.' });
  if (await Enrollment.countDocuments({ batch: batch._id, status: 'enrolled' }) >= batch.capacity) return res.status(409).json({ message: 'This batch is full.' });
  const enrollment = old
    ? await Enrollment.findByIdAndUpdate(old._id, { status: 'enrolled', enrolledAt: new Date() }, { new: true })
    : await Enrollment.create({ student: req.user._id, batch: batch._id });
  res.status(201).json({ enrollment, message: 'Enrollment successful.' });
}));

router.patch('/:id/cancel', protect, run(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });
  if (req.user.role !== 'admin' && String(enrollment.student) !== String(req.user._id)) return res.status(403).json({ message: 'You cannot cancel another student’s enrollment.' });
  if (enrollment.status !== 'enrolled') return res.status(400).json({ message: 'Enrollment is not active.' });
  enrollment.status = 'cancelled';
  await enrollment.save();
  res.json({ enrollment, message: 'Enrollment cancelled.' });
}));

export default router;
