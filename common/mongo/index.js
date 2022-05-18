const mongoose = require('mongoose');

const defaultOption = {
    autoIndex: false,
    autoCreate: false,
    dbName: undefined,
    connectTimeoutMS: 3000 // 不知为啥没效果
};

// 创建一个mongo连接, 返回一个promise
function connect(uri, opts) {
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

function Schema(definition) {
    return new mongoose.Schema(definition);
}

// 返回table操作, https://mongoosejs.com/docs/models.html
exports.model = function(db, name, definition) {
    return db.model(name, Schema(definition));
}

exports.connect = connect;

exports.Schema = Schema;