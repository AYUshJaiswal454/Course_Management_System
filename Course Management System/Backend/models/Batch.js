import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({

     name: { type: String, required: true},
     course: { type: String, required: true},
     instructor: { type: String},
     startDate: { type: String },
     endDate: { type: String },
     schedule: { type: String },
     capacity: { type: Number },
     status: { type: String, enum: ['upcoming', 'open', 'in-progress', 'completed', 'cancelled'] }
  
// }, { timestamps: true 
    
});

export default mongoose.model('Batch', batchSchema);



















// import mongoose from 'mongoose';
// const batchSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//   instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   schedule: { type: String, required: true, trim: true },
//   capacity: { type: Number, required: true, min: 1, max: 500 },
//   status: { type: String, enum: ['upcoming', 'open', 'in-progress', 'completed', 'cancelled'], default: 'open' }
// }, { timestamps: true });
// batchSchema.pre('validate', function(next) {
//   if (this.startDate && this.endDate && this.endDate < this.startDate) this.invalidate('endDate', 'End date must be after start date');
//   next();
// });
// export default mongoose.model('Batch', batchSchema);
