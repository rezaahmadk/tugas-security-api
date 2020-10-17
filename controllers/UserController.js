import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import User from './../models/User.js';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// READ ALL User Data
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        
        if(users){
            res.status(200).json({ auth: true, data: users });
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// READ User Data BY ID
router.get('/:id', async (req, res) => {
    try {
        const users = await User.findById(req.params.id);

        if(users){
            res.status(200).json({ auth: true, data: users });
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// CREATE NEW USER
router.post('/add', async (req, res) => {
    try {
        const{namabelakang, username, password, jabatan} = req.body;

        var saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds);

        User.create({
            namabelakang : namabelakang,
            username : username,
            password : hashedPw,
            jabatan : jabatan
        }, 
        function (err, user) {
            if (err) {
                res.status(500).send({ auth: true, message: 'Data User Gagal Disimpan!' });
            } else {
                res.status(200).json({ auth: true, message: 'Data User Disimpan!', data: user });
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

// UPDATE User BY ID (Not Include Jabatan)
router.post('/update/:id', async (req, res) => {
    try {
        const {namabelakang, username, password} = req.body;
        const users = await User.findById(req.params.id);

        var saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds);

        if(users){
            users.namabelakang = namabelakang;
            users.username = username;
            users.password = hashedPw;

            const updatedUser = await users.save();
            res.status(200).json({ auth: true, message: 'Data User Diubah!', data: updatedUser });
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// UPDATE Jabatan BY ID
router.post('/update-jabatan/:id', async (req, res) => {
    try {
        const {idcurrentuser, jabatan} = req.body;

        // FIND User BY ID Parameter
        const user = await User.findById(req.params.id);

        // FIND Jabatan BY ID User
        const validasiuser = await User.find( { _id: idcurrentuser }, { jabatan: 1 } );

        if(user){
            switch (validasiuser[0].jabatan) {
                case 0:
                    user.jabatan = jabatan;

                    const updatedJabatanByBoss = await user.save();
                    res.json({ auth: true, message: 'Jabatan Berhasil Diubah!', data: updatedJabatanByBoss });
                    break;

                case 1:
                    user.jabatan = jabatan;

                    const updatedJabatanByManager = await user.save();
                    res.json({ auth: true, message: 'Jabatan Berhasil Diubah!', data: updatedJabatanByManager });
                    break;
            
                default:
                    res.status(500).send("Akses Ditolak!");
                    break;
            }
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETE User Data BY ID
router.post('/delete/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(user){
            await user.remove();
            res.json({ auth: true, message: 'Data User Dihapus!' });
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;