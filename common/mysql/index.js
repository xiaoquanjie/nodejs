const mysql = require('mysql');

// 默认的配置
const defaultOption = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test',
    connectTimeout: 3 * 1000
};

// 连接类型与连接
const connTypeMap = {
};

function createConnection(opts) {
    if (!opts.host) {
        opts.host = defaultOption.host;
    }
    if (!opts.port) {
        opts.port = defaultOption.port;
    }
    if (!opts.user) {
        opts.user = defaultOption.user;
    }
    if (!opts.password) {
        opts.password = defaultOption.password;
    }
    if (!opts.database) {
        opts.database = defaultOption.database;
    }
    if (!opts.connectTimeout) {
        opts.connectTimeout = defaultOption.connectTimeout;
    }
    
    return new Promise(function(resolve, reject) {
        var conn = mysql.createConnection(opts);
        conn.connect(function(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(conn);
            }
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
        var conn = connTypeMap[connType].conn;
        connTypeMap[connType].conn = undefined;
        conn.end(function(err) {
            resolve();
        });
    });
}

// 执行语句
function query(connType, sql, any) {
    return new Promise(function(resolve, reject) {
        getConnection(connType)
        .then(function(conn) {
            var cb = function(err, results, fields) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve([results, fields]);
                }
            };
            conn.query(sql, any, cb);
        })
        .catch(function(err) {
            reject(err);
        });
    });
}

exports.setConnectionOpts = setConnectionOpts;
exports.createConnection = createConnection;
exports.getConnection = getConnection;
exports.closeConnection = closeConnection;
exports.query = query;




