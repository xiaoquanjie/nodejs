const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const stringRandom = require('string-random');
const express = require('express');

const defaultConfigure = {
    // url encoded option
    urlEncodedOpt: {
        extended: true
    },
    // signed cookie secret
    cookieSecret: stringRandom(128, { numbers: true }),
    // session option
    sessionOpt: {
        secret: stringRandom(128, { numbers: true }),
        resave: true,
        saveUninitialized: false,
        cookie: { 
            maxAge: 1000* 60 * 60 
        }
    }
}

function configure(urlEncodedOpt, cookieSecret, sessionOpt) {
    if (urlEncodedOpt) {
        defaultConfigure.urlEncodedOpt = urlEncodedOpt;
    }
    if (cookieSecret) {
        defaultConfigure.cookieSecret = cookieSecret;
    }
    if (sessionOpt) {
        defaultConfigure.sessionOpt = sessionOpt;
    }
}

module.exports = function(urlEncodedOpt, cookieSecret, sessionOpt) {
    configure(urlEncodedOpt, cookieSecret, sessionOpt);

    var router = express.Router();

    // query解析
    router.use(bodyParser.urlencoded(defaultConfigure.urlEncodedOpt));

    // cookie功能
    router.use(cookieParser(defaultConfigure.cookieSecret));

    // 会话
    router.use(session(defaultConfigure.sessionOpt));

    // 返回路由
    return router;
}

module.exports.configure = configure;

module.exports.clearCookie = function(res, key) {
    return res.clearCookie(key);
}

module.exports.cookies = function(req) {
    return req.cookies;
}

module.exports.signedCookies = function(req) {
    return req.signedCookies;
}

module.exports.setCookie = function(res, key, value) {
    return res.cookie(key, value);
}

module.exports.setSignedCookie = function(res, key, value, opt) {
    if (!opt) {
        opt = { signed: true };
    }
    return res.cookie(key, value, opt);
}

module.exports.getCookie = function(req, key) {
    return req.cookies[key];
}

module.exports.getSignedCookie = function(req, key) {
    return req.signedCookies[key];
}

module.exports.session = function(req) {
    return req.session;
}

module.exports.setSession = function(req, key, value) {
    return req.session[key] = value;
}

module.exports.getSession = function(req, key) {
    return req.session[key];
}