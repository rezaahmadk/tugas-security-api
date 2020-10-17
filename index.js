import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import UserRouter from './controllers/UserController.js';
import LoginRouter from './controllers/LoginController.js';
import TransactionRouter from './controllers/TransactionController.js';
import Authorization from './auth/Authorization.js';

const app = express();

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true, 
        });

        console.log('Connect to DB Success');
    } catch (err) {
        console.log(err);
    }
}

connectDB();

app.use(morgan('dev'));

app.use('/login', LoginRouter);
app.use('/users', Authorization, UserRouter);
app.use('/transaction', Authorization, TransactionRouter);

app.listen(process.env.PORT, () => {
    console.log('App Listen to Port 3000');
});