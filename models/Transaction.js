import mongoose from 'mongoose';
import user from './User.js';

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const users = user();

const transactionSchema = new mongoose.Schema(
  {
    uangmasuk: {
      type: String,
      required: false,
    },
    uangkeluar: {
      type: String,
      required: false,
    },
    saldo: {
      type: String,
      required: false,
    },
    _userid: [{
      type: ObjectId, 
      ref: users,
      required: true
    }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('Transaction', transactionSchema);

export default User;