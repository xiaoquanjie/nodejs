const redis = require('redis');

const defaultOption = {
    username: '',           // 用户名
    password: '',           // 密码
    database: 0,            // 库编号
    host: 'localhost',      // host
    port: 6379              // port
};

function connect(opts) {
    var uri = 'redis://';
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

    if (!opts.database) {
        opts.database = defaultOption.database;
    }
    uri += opts.database;

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

exports.connect = connect;



