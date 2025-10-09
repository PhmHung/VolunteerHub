import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true },
  password: { 
    type: String, 
    required: true, 
    trim: true,
  }, 
  personalInformation: {
    name: { type: String, trim: true, required: true },
    picture: String,
    biography: { type: String, trim: true, maxlength: 300 },
    startDate: { type: Date, default: Date.now, required: true }
  }
}, 
{ timestamps: true });

userSchema.index({ email: 'text' });

const User = mongoose.model('User', userSchema);
export default User;
