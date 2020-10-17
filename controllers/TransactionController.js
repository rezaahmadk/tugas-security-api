import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import User from './../models/User.js';
import Transaction from './../models/Transaction.js';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// READ ALL Transaction Data
router.get('/', async (req, res) => {
    try {
        const transaction = await Transaction.find();

        if(transaction){
            res.status(200).json({ auth: true, data: transaction });
        } else {
            res.status(404).json({ auth: true, message: 'Transaksi Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// READ Transaction Data BY ID
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if(transaction){
            res.status(200).json({ auth: true, data: transaction });
        } else {
            res.status(404).json({ auth: true, message: 'Transaksi Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// CREATE New Transaction Data
router.post('/add', async (req, res) => {
    try {
        const{uangmasuk, uangkeluar, userid} = req.body;

        // FIND Jabatan BY ID User
        const user = await User.find( { _id: userid }, { jabatan: 1 } );
        if (user) {
            switch (user[0].jabatan) {
                case 0: // CASE BOSS
                    Transaction.create({
                        uangmasuk : uangmasuk,
                        uangkeluar : uangkeluar,
                        saldo : uangmasuk - uangkeluar,
                        _userid : userid
                    }, 
                    function (err, user) {
                        if (err) {
                            res.status(500).json({ auth: true, message: 'Data Gagal Disimpan!' });
                        } else {
                            res.status(200).json({ auth: true, message: 'Data Disimpan!', data: user });
                        }
                    });
                    break;

                case 1: // CASE MANAGER
                    if (!uangkeluar) {
                        Transaction.create({
                            uangmasuk : uangmasuk,
                            saldo : uangmasuk,
                            _userid : userid
                        }, 
                        function (err, user) {
                            if (err) {
                                res.status(500).json({ auth: true, message: 'Data Gagal Disimpan!' });
                            } else {
                                res.status(200).json({ auth: true, message: 'Data Disimpan!', data: user });
                            }
                        });
                    } else {
                        res.status(500).send({ auth: true, message: "Tidak Memiliki Wewenang!"});
                    }
                    break;

                case 2: // CASE CHASIER
                    if (!uangkeluar) {
                        Transaction.create({
                            uangmasuk : uangmasuk,
                            _userid : userid
                        }, 
                        function (err, user) {
                            if (err) {
                                res.status(500).json({ auth: true, message: 'Data Gagal Disimpan!' });
                            } else {
                                res.status(200).json({ auth: true, message: 'Data Disimpan!', data: user });
                            }
                        });
                    } else {
                        res.status(500).json({ auth: true, message: "Tidak Memiliki Wewenang!"});
                    }
                    break
            
                default:
                    res.status(500).json({ auth: false, message: "Akses Ditolak!"});
                    break;
            }
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json({ error: error});
    }
});

// UPDATE Transaction BY ID
router.post('/update/:id', async (req, res) => {
    try {
        const{uangmasuk, uangkeluar, userid} = req.body;

        // FIND Jabatan BY ID User
        const user = await User.find( { _id: userid }, { jabatan: 1 } );

        const transaction = await Transaction.findById(req.params.id);

        if (user) {
            
            if (transaction) {
                switch (user[0].jabatan) {
                    case 0: // CASE BOSS
                        transaction.uangmasuk = uangmasuk;
                        transaction.uangkeluar = uangkeluar;
                        transaction.saldo = uangmasuk - uangkeluar;
                
                        const updatedTransactionBoss = await transaction.save();
                
                        res.status(200).json({ auth: true, message: 'Data Transaksi Diubah!', data: updatedTransactionBoss });
                        break;
    
                    case 1: // CASE MANAGER
                        if (!uangkeluar) {
                            transaction.uangmasuk = uangmasuk;
                            transaction.saldo = uangmasuk;
                
                            const updatedTransactionManager = await transaction.save();
                
                            res.status(200).json({ auth: true, message: 'Data Transaksi Diubah!', data: updatedTransactionManager });
                        } else {
                            res.status(500).json({ auth: true, message: "Tidak Memiliki Wewenang!"});
                        }
                        break;
    
                    case 2: // CASE CHASIER
                        if (!uangkeluar) {
                            transaction.uangmasuk = uangmasuk;
                
                            const updatedTransactionChasier = await transaction.save();
                
                            res.status(200).json({ auth: true, message: 'Data Transaksi Diubah!', data: updatedTransactionChasier });
                        } else {
                            res.status(500).json({ auth: true, message: "Tidak Memiliki Wewenang!"});
                        }
                        break
                
                    default:
                        res.status(500).json({ auth: false, message: "Akses Ditolak!"});
                        break;
                }
            } else {
                res.status(404).json({ auth: true, message: 'Transaksi Tidak Ditemukan!' });
            }
        } else {
            res.status(404).json({ auth: true, message: 'User Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETE Transaction Data BY ID
router.post('/delete/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if(transaction){
            await transaction.remove();
            res.status(200).json({ auth: true, message: 'Data Transaksi Dihapus!' });
        } else {
            res.status(404).json({ auth: true, message: 'Transaksi Tidak Ditemukan' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETE ALL Transaction Data
router.post('/delete-all', async (req, res) => {
    try {
        const hapus = await Transaction.deleteMany( { } );
        if(hapus){
            res.json({ message: 'Semua Data Transaksi Dihapus!', data: hapus});
        } else {
            res.status(404).json({ message: 'Data Tidak Ditemukan!' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;