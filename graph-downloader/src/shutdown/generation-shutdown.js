const fs = require('fs')

const FormatSettings = require('./../utilities/settings/format-settings')

const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const GLOBAL_PROCESS_COMMAND = require('./../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const GENERATION_PROCESS_PHASES = require('./../shutdown/phases')
    .GENERATION_PROCESS_PHASES
const { sendMessage } = require('./../utilities/process')

var currentPhase = undefined

module.exports = {
    setShutdownBehaviour: () => {
        process.on('SIGINT', () => {})
    },
    isRunning: () => {
        /*
        if json is correct read the vaue, if is incorrect, main process write file while
        children read, then state was change to false, and i return false in catch.
        */
        try {
            const jsonData = JSON.parse(
                fs.readFileSync(GLOBAL_CONSTANTS.runningFilename())
            )
            return jsonData.running
        } catch (err) {
            return false
        }
    },
    changePhase: phase => {
        currentPhase = phase
    },
    getCurrentPhase: () => {
        return currentPhase
    },
    saveState: (lastLine, graphPath) => {
        sendMessage(GLOBAL_PROCESS_COMMAND.stoppedCommand(), {
            format: {
                format_name: FormatSettings.getFormat(),
                phase: currentPhase,
                last_line: lastLine,
                file_path: graphPath
            }
        })
    },
    onCompletedProcess: () => {
        process.send(
            {
                pid: process.pid,
                command: GLOBAL_PROCESS_COMMAND.endCommand(),
                data: {
                    format: {
                        format_name: FormatSettings.getFormat(),
                        phase: GENERATION_PROCESS_PHASES.TerminatedPhase()
                    }
                }
            },
            () => {
                process.disconnect()
                process.exit(0)
            }
        )
    },
    terminate: () => {
        process.disconnect()
        process.exit(0)
    }
}
