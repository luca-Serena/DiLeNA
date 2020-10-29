const child_process = require('child_process')

const SpecSettings = require('../utilities/settings/spec-settings')
const RunSettings = require('../utilities/settings/run-settings')
const MainShutdown = require('./../shutdown/main-shutdown')

const MAIN_PROCESS_PHASES = require('./../shutdown/phases').MAIN_PROCESS_PHASES
const GENERATION_PROCESS_PHASES = require('./../shutdown/phases')
    .GENERATION_PROCESS_PHASES
const GLOBAL_PROCESS_COMMAND = require('./../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const CURRENT_FORMATS = require('../current-project-state/current-formats')
    .CURRENT_FORMATS

const logger = require('./../utilities/log')

const { move } = require('./../no-layout/placer')
const { sendMessage } = require('./../utilities/process')

function generate(resumeData) {
    MainShutdown.changePhase(MAIN_PROCESS_PHASES.GenerationPhase())

    const workers = new Map()
    var children = 0
    var childrenTerminated = 0
    var shutdownCalled = false

    //filter and start children not terminated
    if (resumeData != undefined) {
        resumeData.forEach(res => {
            const key = Object.keys(CURRENT_FORMATS).filter(
                key =>
                    CURRENT_FORMATS[key].name === res.format_name &&
                    res.phase !== GENERATION_PROCESS_PHASES.TerminatedPhase()
            )[0]
            const formatName = CURRENT_FORMATS[key].name
            const formatPath = CURRENT_FORMATS[key].process
            if (formatName != undefined && formatPath != undefined) {
                startWorker(formatName, formatPath)
            }
        })
    } else {
        Object.keys(CURRENT_FORMATS).forEach(key =>
            startWorker(CURRENT_FORMATS[key].name, CURRENT_FORMATS[key].process)
        )
    }

    function startWorker(formatName, formatPath) {
        children += 1

        const child = child_process.fork(formatPath, {
            execArgv: [
                '--max-old-space-size=' + SpecSettings.getProcessMemory()
            ]
        })

        workers.set(child.pid, child)

        child.on('message', function(message) {
            switch (message.command) {
                case GLOBAL_PROCESS_COMMAND.endCommand():
                    sendMessage(
                        GLOBAL_PROCESS_COMMAND.endCommand(),
                        undefined,
                        workers.get(message.pid)
                    )
                    childrenTerminated += 1
                    MainShutdown.save(message.data)
                    if (childrenTerminated == children) {
                        if (shutdownCalled || !MainShutdown.isRunning()) {
                            MainShutdown.terminate()
                        } else {
                            move()
                        }
                    }
                    break
                case GLOBAL_PROCESS_COMMAND.stoppedCommand():
                    shutdownCalled = true
                    childrenTerminated += 1
                    MainShutdown.save(message.data)
                    if (childrenTerminated == children) {
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

        //send config of previous run
        const resData =
            resumeData != undefined
                ? resumeData.filter(
                      format => format.format_name === formatName
                  )[0]
                : undefined

        sendMessage(
            GLOBAL_PROCESS_COMMAND.startCommand(),
            {
                loggerPath: logger.getPath(),
                saveFolder: RunSettings.getSaveFolderPath(),
                folderName: RunSettings.getFolderName(),
                range: RunSettings.getRange(),
                memory: SpecSettings.getProcessMemory(),
                oldDownload: RunSettings.getOldDownload(),
                resumeData: resData
            },
            child
        )
    }
}

module.exports = {
    generate
}
