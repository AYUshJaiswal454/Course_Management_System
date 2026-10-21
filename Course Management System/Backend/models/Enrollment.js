import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({

     student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
     status: { type: String, enum: ['enrolled', 'cancelled', 'completed'], default: 'enrolled' },
     enrolledAt: { type: Date, default: Date.now }
  
// }, { timestamps: true 
    
});
enrollmentSchema.index({ student: 1, batch: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);






















// import mongoose from 'mongoose';
// const enrollmentSchema = new mongoose.Schema({
//   student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
//   status: { type: String, enum: ['enrolled', 'cancelled', 'completed'], default: 'enrolled' },
//   enrolledAt: { type: Date, default: Date.now }
// }, { timestamps: true });
// enrollmentSchema.index({ student: 1, batch: 1 }, { unique: true });
// export default mongoose.model('Enrollment', enrollmentSchema);
