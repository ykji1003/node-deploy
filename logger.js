const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level : 'info',          // 심각도
    format : format.json(),  // 로그의형식
    transports : [           // 로그 저장 방식
        new transports.File({ filename : 'combined.log'}),
        new transports.File({filename : 'error.log', level : 'error'}),
    ],
})

if(process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({ format : format.simple()}));
}

module.exports = logger;