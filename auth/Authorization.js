import jwt from 'jsonwebtoken';
import config from './../config.js';

const authorization = function (req, res, next) {
    const token = req.headers['x-access-token'];

    if (!token) {
        res.status(401).send({ auth: false, message: 'No Token Provided!' });
    } else {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                res.status(500).send({ auth: false, message: 'Failed to Authenticate Token!' });
            } else {
                next();
            }
        });
    }
}

export default authorization;