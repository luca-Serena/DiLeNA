const child_process = require('child_process')

const MainShutdown = require('./../shutdown/main-shutdown')

const SpecsSettings = require('../utilities/settings/spec-settings')

const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const MAIN_PROCESS_PHASES = require('./../shutdown/phases').MAIN_PROCESS_PHASES
const GLOBAL_PROCESS_COMMAND = require('./../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const DOWNLOAD_PROCESS_COMMAND = require('./../utilities/process')
    .DOWNLOAD_PROCESS_COMMAND
const RunSettings = require('./../utilities/settings/run-settings')

const logger = require('./../utilities/log')

const { generate } = require('./../generation/generator-master')
const { sendMessage } = require('./../utilities/process')

const chunkSize = 50
const progressBarMsg = `Retrieving chunk (each one has size of ${chunkSize})...`

module.exports = (start, end) => {
    logger.log('Start download phase')
    MainShutdown.changePhase(MAIN_PROCESS_PHASES.DownloadPhase())

    const workers = new Map()

    var shutdownCalled = false
    //only for graphic reason, can use progressBar.curr, but log would be wrong
    var lastChunk = 0

    var task = {
        start: start,
        end: end
    }

    const chunkNumber = Math.ceil((task.end - task.start + 1) / chunkSize)
    const progressBar = logger.progress(progressBarMsg, chunkNumber)

    function availableTask() {
        function getTask() {
            const ret = Array(
                task.end - task.start >= chunkSize
                    ? chunkSize
                    : task.end - task.start + 1
            )
                .fill(1)
                .map((one, index) => task.start + one + (index - 1))
            task.start += chunkSize
            return ret
        }
        if (task.start <= task.end && MainShutdown.isRunning()) {
            return getTask()
        }
        return false
    }

    function startWorkers(infuraApiKey) {
        var endedChild = 0


        for (var i = 0; i < SpecsSettings.getDownloadWorkers(); i++) {
            const child = child_process.fork(
                './build/download/downloader-worker'
            )
            workers.set(child.pid, child)
            sendMessage(
                DOWNLOAD_PROCESS_COMMAND.configCommand(),
                {
                    filename:
                        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                        i +
                        '.json',
                    api: infuraApiKey,
                    blockchain_type: RunSettings.getBlockchain().type_name
                },
                child
            )
            child.on('message', function(message) {
                switch (message.command) {
                    case DOWNLOAD_PROCESS_COMMAND.newTaskCommand():
                        var progressBarTextualForm
                        if (!message.data.config) {
                            lastChunk += 1
                            progressBarTextualForm =
                                progressBarMsg +
                                ' ' +
                                lastChunk +
                                '/' +
                                chunkNumber
                            if (MainShutdown.isRunning()) {
                                progressBar.tick()
                            } else {
                                logger.log(progressBarTextualForm)
                            }
                        }
                        const res = availableTask()
                        if (!res) {
                            sendMessage(
                                GLOBAL_PROCESS_COMMAND.endCommand(),
                                undefined,
                                workers.get(message.pid)
                            )
                            endedChild++
                            if (
                                endedChild == SpecsSettings.getDownloadWorkers()
                            ) {
                                if (
                                    shutdownCalled ||
                                    !MainShutdown.isRunning()
                                ) {
                                    MainShutdown.save({ missing: task })
                                    MainShutdown.terminate()
                                } else {
                                    logger.onlyLogFile(progressBarTextualForm)
                                    generate()
                                }
                            }
                        } else {
                            sendMessage(
                                DOWNLOAD_PROCESS_COMMAND.newTaskCommand(),
                                { task: res },
                                workers.get(message.pid)
                            )
                        }
                        break
                    case GLOBAL_PROCESS_COMMAND.stoppedCommand():
                        shutdownCalled = true
                        endedChild++
                        if (endedChild == SpecsSettings.getDownloadWorkers()) {
                            MainShutdown.terminate()
                        }
                        break
                    default:
                        logger.error(
                            '[child ' +
                                message.child +
                                '] send wrong command + ' +
                                message.command
                        )
                }
            })
        }
    }

    return {
        startWorkers
    }
}
