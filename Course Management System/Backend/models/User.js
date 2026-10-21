import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({

  name: { type: String, required: true, maxlength: 80  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' }
// }, { timestamps: true 
    
});

export default mongoose.model('User', userSchema);
























// import mongoose from 'mongoose';
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true, maxlength: 80 },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true, select: false },
//   role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' }
// }, { timestamps: true });
// export default mongoose.model('User', userSchema);
