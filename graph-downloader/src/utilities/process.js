const GLOBAL_PROCESS_COMMAND = Object.freeze({
    startCommand: () => 'start',
    stoppedCommand: () => 'stopped',
    endCommand: () => 'end'
})

const DOWNLOAD_PROCESS_COMMAND = Object.freeze({
    configCommand: () => 'config',
    newTaskCommand: () => 'new Task'
})

function sendMessage(command, data = undefined, receiver = undefined) {
    const rec = receiver != undefined ? receiver : process
    rec.send({
        pid: process.pid,
        command: command,
        data: data
    })
}

module.exports = {
    GLOBAL_PROCESS_COMMAND,
    DOWNLOAD_PROCESS_COMMAND,
    sendMessage
}
