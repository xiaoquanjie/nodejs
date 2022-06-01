const utils = require('../utils');

// url encoded option
let defaultEncodedConfigure = {
    extended: true
};

// session option
let defaultSessionConfigure = {
    secret: undefined,              // 必须要有
    resave: true,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000* 60 * 60 
    }
};

// jsonwebtoken option
let defaultJwtConfigure = {
    opt: {
        algorithms: ['HS256'],
        secret: undefined,         // 必须要有
        requestProperty: 'auth',   // 有效负载的属性的名称
        isRevoked: undefined,      // 验证令牌是否被撤销的函数
        credentialsRequired: true, // 如果为假，如果请求不包含令牌而不是失败，则继续下一个中间件
        getToken : undefined       // 校验token的函数，默认情况下它在Authorizationheader中查找
    },
    path: [],
    expire: '6h'
};

// opt不为undefined时，表示功能开启
module.exports = function(urlEncodedOpt, jsonOpt, cookieSecret, sessionOpt, jwtOpt) {
    // 创建路由
    let router = require('express').Router();

    // query解析
    if (urlEncodedOpt != undefined) {
        defaultEncodedConfigure = utils.deepmerge(defaultEncodedConfigure, urlEncodedOpt);
        router.use(require('body-parser').urlencoded(defaultEncodedConfigure));
    }

    // 解析body Content-Type:application/json
    if (jsonOpt != undefined) {
        jsonOpt = utils.deepmerge({limit: '100mb'}, jsonOpt);
        router.use(require('express').json(jsonOpt))
    }

    // cookie功能
    if (cookieSecret != undefined) {
        router.use(require('cookie-parser')(cookieSecret));
    }

    // 会话
    if (sessionOpt != undefined) {
        defaultSessionConfigure = utils.deepmerge(defaultSessionConfigure, sessionOpt);
        router.use(require('express-session')(defaultSessionConfigure));
    }

    // jsonwebtoken, 记得要处理异常
    if(jwtOpt != undefined) {
        defaultJwtConfigure = utils.deepmerge(defaultJwtConfigure, jwtOpt);
        ex_jwt = require("express-jwt").expressjwt(defaultJwtConfigure.opt).unless({path:defaultJwtConfigure.path});
        router.use(ex_jwt);
    }
    
    // 返回路由
    return router;
}

module.exports.jwtSign = function(payload) {
    // payload可在req.auth里获取到
    let token = 'Bearer ' + require('jsonwebtoken').sign(payload, defaultJwtConfigure.opt.secret, { expiresIn: defaultJwtConfigure.expire});
    return token;
}

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