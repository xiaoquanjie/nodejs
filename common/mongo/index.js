const mongoose = require('mongoose');

// 默认的配置
const defaultOption = {
    autoIndex: false,
    autoCreate: false,
    dbName: undefined,
    connectTimeoutMS: 3000 // 不知为啥没效果
};

// 连接类型与连接
const connTypeMap = {};

// 创建一个mongo连接, 返回一个promise
function createConnection(uri, opts) {
    if (!opts) {
        opts = defaultOption;
    }
    return new Promise(function(resolve, reject) {
        mongoose.createConnection(uri, opts, function(err, db) {
            if (err) {
                reject(err);
            }
            else {
                resolve(db);
            }
        });
    });
}

// 设置连接选项
function setConnectionOpts(connType, uri, opts) {
    connTypeMap[connType] = { uri: uri, opts: opts, conn: undefined };
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
            connTypeMap[connType].uri,
            connTypeMap[connType].opts
        )
        .then(function(conn) {
            conn.on('close', function() {
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
        conn.close().then(function() { resolve(); }).catch(function(err) { reject(err); });
    });
}

function Schema(definition) {
    return new mongoose.Schema(definition);
}

// 返回table操作, https://mongoosejs.com/docs/models.html
exports.model = function(db, name, definition) {
    return db.model(name, Schema(definition));
}

exports.createConnection = createConnection;
exports.setConnectionOpts = setConnectionOpts;
exports.getConnection = getConnection;
exports.closeConnection = closeConnection;
exports.Schema = Schema;