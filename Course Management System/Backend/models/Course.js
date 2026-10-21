import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({

     title: { type: String, required: true},
  code: { type: String, required: true},
  description: { type: String},
  category: { type: String },
  durationWeeks: { type: Number },
  instructor: { type: mongoose.Schema.Types.ObjectId },
  active: { type: Boolean }
// }, { timestamps: true 
    
});

export default mongoose.model('Course', courseSchema);






// import mongoose from 'mongoose';
// const courseSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true, maxlength: 120 },
//   code: { type: String, required: true, trim: true, uppercase: true, unique: true },
//   description: { type: String, default: '', maxlength: 2000 },
//   category: { type: String, default: 'General' },
//   durationWeeks: { type: Number, min: 1, default: 4 },
//   instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   active: { type: Boolean, default: true }
// }, { timestamps: true });
// export default mongoose.model('Course', courseSchema);
