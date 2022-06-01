const redis = require('redis');

// notice: 读二进制需要这个标记
// redis.commandOptions({ returnBuffers: true }

// 默认的配置
const defaultOption = {
    username: '',           // 用户名
    password: '',           // 密码
    database: 0,            // 库编号
    host: 'localhost',      // host
    port: 6379              // port
};

// 连接类型与连接
const connTypeMap = {
};

function createUri(opts) {
    let uri = 'redis://';
    if (!opts.username) {
        opts.username = defaultOption.username;
    }
    uri += opts.username + ':';
    
    if (!opts.password) {
        opts.password = defaultOption.password;
    }
    uri += opts.password + '@';

    if (!opts.host) {
        opts.host = defaultOption.host;
    }
    uri += opts.host + ':';

    if (!opts.port) {
        opts.port = defaultOption.port;
    }
    uri += opts.port + '/';

    return uri;
}

// 创建一个连接
function createConnection(opts) {
    let uri = createUri(opts);
    return new Promise(function(resolve, reject) {
        const client = redis.createClient({url: uri});
        client.connect();
        client.on('connect', function() {
            resolve(client);
        });
        client.on('error', function(err) {
            reject(err);
        });
    });
}

// 设置连接选项
function setConnectionOpts(connType, opts) {
    connTypeMap[connType] = { opts: opts, conn: undefined };
}

// 获取一个连接
function getConnection(connType) {
    return new Promise(function(resolve, reject) {
        // 不认识的类型
        if (!connTypeMap[connType]) {
            return reject("ilegal connType:" + connType);
        }
        // 已有连接直接获取
        if (connTypeMap[connType].conn) {
            return resolve(connTypeMap[connType].conn);
        }
        // 创建连接
        createConnection(
            connTypeMap[connType].opts
        )
        .then(function(conn) {
            // 连接断开，则设置为空
            conn.on('end', function() {
                connTypeMap[connType].conn = undefined;
            });
            connTypeMap[connType].conn = conn;
            resolve(conn);
        })
        .catch(function(err) {
            reject(err);
        });
    });
}

// 关闭连接
function closeConnection(connType) {
    return new Promise(function(resolve, reject) {
        if (!connTypeMap[connType]) {
            return resolve();
        }
        if (!connTypeMap[connType].conn) {
            return resolve();
        }
        let conn = connTypeMap[connType].conn;
        connTypeMap[connType].conn = undefined;
        conn.quit().then(function() { resolve(); }).catch(function(err) { reject(err); });
    });
}

//module.exports = redis;
module.exports.setConnectionOpts = setConnectionOpts;
module.exports.createConnection = createConnection;
module.exports.getConnection = getConnection;
module.exports.closeConnection = closeConnection;
module.exports.commandOptions = redis.commandOptions;
