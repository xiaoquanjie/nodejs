const log4js = require('log4js');

let defaultConfigure = {
    fileName: './app.log',              // 默认的日志名
    maxLogSize: 1024 * 1024 * 100,      // 默认文件大小100M
    backups: 100,                       // 默认保留文件数
    categorie: 'default'                // 默认的目录
}

// 配置,是可以被多次调用的
exports.configure = function (configure) {
    if (!configure) {
        configure = defaultConfigure;
    }
    if (!configure.fileName) {
        configure.fileName = defaultConfigure.fileName;
    }
    if (!configure.maxLogSize) {
        configure.maxLogSize = defaultConfigure.maxLogSize;
    }
    if (!configure.backups) {
        configure.backups = defaultConfigure.backups;
    }
    if (configure.categorie) {
        defaultConfigure.categorie = configure.categorie;
    }

    // configure
    log4js.configure({
        // 输出位置
        appenders: {
            // 控制台输出者
            console: { type: 'console' },
            // 文件输出，
            file: { type: 'file', filename: configure.fileName, maxLogSize: configure.maxLogSize, keepFileExt: true, backups: configure.backups }
        },
        categories: {
            //appenders:采用的appender,取上面appenders项,level:设置级别
            default: { appenders: ['console', 'file'], level: 'trace' }, //error写入时是经过筛选后留下的
        }
    });
}

function getLogger() {
    return log4js.getLogger(defaultConfigure.categorie);
}

// 绑定express app
exports.bindApp = function(app) {
    var logger = log4js.connectLogger(getLogger());
    app.use(logger);
}

// 设置等级
exports.level = function level(lvl) {
    getLogger().level = lvl;
}

exports.trace = function(...args) {
    getLogger().trace(args);
}

exports.debug = function(...args) {
    getLogger().debug(args);
}

exports.info = function(...args) {
    getLogger().info(args);
}

exports.warn = function(...args) {
    getLogger().warn(args);
}

exports.error = function(...args) {
    getLogger().error(args);
}

exports.fatal = function(...args) {
    getLogger().fatal(args);
}










