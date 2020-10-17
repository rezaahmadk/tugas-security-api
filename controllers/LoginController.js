import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import User from './../models/User.js';
import config from './../config.js';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// LOGIN User
router.post('/', async (req, res) => {
    try{
        const{username, password} = req.body;
    
        const currentUser = await new Promise((resolve, reject) =>{
            User.find({"username": username}, function(err, user){
                if(err)
                    reject(err)
                resolve(user)
            })
        });
        
        //Cek Ketersediaan User
        if(currentUser[0]){
            //Cek Password
            bcrypt.compare(password, currentUser[0].password).then(function(result) {
                if(result){
                    const token = jwt.sign({ id: currentUser[0]._id }, config.secret, {
                        expiresIn: 1200 // Expires in 20 minutes
                    });
                    res.status(200).send({ status: "Berhasil Login!", auth: true, token: token });
                } else {
                    res.status(201).json({ status: "Password Salah!" });
                }
            });
        } else {
            res.status(201).json({ status: "Username Tidak Ditemukan" });
        }
    }
    catch(error){
        res.status(500).json(error);
    }
});

export default router;