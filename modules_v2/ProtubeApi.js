const express = require('express');
const bearerToken = require('express-bearer-token');
const { checkBearerToken } = require('./Middlewares');

exports.protubeApi = express.Router();

this.protubeApi.use(bearerToken());
this.protubeApi.use(checkBearerToken);

this.protubeApi.post('/updateadmins', async function(req, res){
    // todo refresh all admins
    res.send({ success: true});
});
