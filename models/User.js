import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    namabelakang: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    jabatan: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;