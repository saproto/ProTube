const express = require('express');
const passport = require('passport');
require('passport-oauth2');
const { checkAuthenticated } = require('./Middlewares');

exports.authApi = express.Router();


this.authApi.get('/home', function(req, res){
    res.send("hoii");
});

this.authApi.get('/login', passport.authenticate('oauth2'));

this.authApi.get('/user', checkAuthenticated, (req, res) => {
    res.send({
        name: req.session.passport.user.name,
        admin: !!req.user.admin,
        hasValidRemote: req.session?.screencode?.correct ?? false
    });
});

this.authApi.get('/auth', checkAuthenticated, (req, res) => {
    res.send(req.session);
});

this.authApi.get('/login/callback', passport.authenticate('oauth2', { failureRedirect: '/fail' }), (req, res)=>{
    res.status(200).redirect('/protube/remote');
});

