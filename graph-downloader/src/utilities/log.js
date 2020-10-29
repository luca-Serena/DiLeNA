const fs = require('fs')
const colors = require('colors/safe')
const ProgressBar = require('progress')

const { ensureDirExists } = require('./file-utils')

const levels = {
    LOG: {
        text: 'LOG',
        color: colors.green
    },
    WARNING: {
        text: 'WARNING',
        color: colors.yellow
    },
    ERROR: {
        text: 'ERROR',
        color: colors.red
    },
    ARGS: {
        text: 'MISSING ARGS',
        color: colors.cyan
    }
}

var stream
var loggerPath

function getLevel(level) {
    for (var lv in levels) {
        if (lv === level) {
            return levels[lv]
        }
    }
    return levels['log']
}

function logDate() {
    return `[${new Date().toISOString()}]`
}

function uncoloredLog(level, str) {
    const info = getLevel(level)
    return `${info.text} ${logDate()} ${str}`
}

function coloredLog(level, str) {
    const info = getLevel(level)
    return `${info.color(info.text)} ${colors.bold(logDate())} ${str}`
}

function createLogStream(path) {
    ensureDirExists(path)
    return fs.createWriteStream(path, { flags: 'a' })
}

const Logger = (module.exports = {
    setPath: (path) => {
        loggerPath = path
        stream = createLogStream(path)
    },
    getPath: () => {
        return loggerPath
    },
    //empty cb so if not defined in function call all works, and needed for last call befor shutdown
    log: (str, cb = () => {}) => {
        console.log(coloredLog('LOG', str))
        stream.write(uncoloredLog('LOG', str) + '\n', cb)
    },
    error: (str) => {
        console.log(coloredLog('ERROR', str))
        stream.write(uncoloredLog('ERROR', str) + '\n')
    },
    warning: (str) => {
        console.log(coloredLog('WARNING', str))
        stream.write(uncoloredLog('WARNING', str) + '\n')
    },
    args: (str) => {
        console.log(coloredLog('ARGS', str))
        stream.write(uncoloredLog('ARGS', str) + '\n')
    },
    onlyLogFile: (str) => {
        stream.write(uncoloredLog('LOG', str) + '\n')
    },
    end: () => {
        stream.end()
    },
    progress: (message, maxTicks) => {
        stream.write(uncoloredLog('LOG', message + ' 0/' + maxTicks) + '\n')
        return new ProgressBar(
            `${coloredLog('LOG', colors.cyan(message))} [:bar] :current/:total`,
            { total: maxTicks, head: '>', width: 30 }
        )
    }
})
