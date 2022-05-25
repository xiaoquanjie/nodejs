const log4js = require('log4js');

const defaultConfigure = {
    fileName: './app.log',              // 默认的日志名
    maxLogSize: 1024 * 1024 * 100,      // 默认文件大小100M
    backups: 100,                       // 默认保留文件数
    categorie: 'default'                // 默认的目录
}

// 配置,是可以被多次调用的
function configure(configure) {
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

// express可以用的中间件
module.exports = function() {
    var logger = log4js.connectLogger(getLogger());
    return logger;
}

module.exports.configure = configure;

// 设置等级
module.exports.level = function level(lvl) {
    getLogger().level = lvl;
}

module.exports.trace = function(...args) {
    getLogger().trace(args);
}

module.exports.debug = function(...args) {
    getLogger().debug(args);
}

module.exports.info = function(...args) {
    getLogger().info(args);
}

module.exports.warn = function(...args) {
    getLogger().warn(args);
}

module.exports.error = function(...args) {
    getLogger().error(args);
}

module.exports.fatal = function(...args) {
    getLogger().fatal(args);
}










