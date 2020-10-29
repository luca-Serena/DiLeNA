const fs = require('fs')

const logger = require('../utilities/log')

const RunSettings = require('../utilities/settings/run-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')
const MAIN_PROCESS_PHASES = require('./phases').MAIN_PROCESS_PHASES
const NO_LAYOUT_CONSTANTS = require('./../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS
const { saveInfo } = require('./../utilities/files')
const { ensureDirExists } = require('../utilities/file-utils')

var currentPhase = MAIN_PROCESS_PHASES.ParsePhase()

const info = {
    blockchain: undefined,
    logger_path: undefined,
    requested_data: undefined,
    folder_path: undefined,
    folder_name: undefined,
    range: undefined,
    missing: {},
    phase: currentPhase,
    format: []
}

module.exports = {
    setShutdownBehaviour: () => {
        ensureDirExists(NO_LAYOUT_CONSTANTS.noLayoutPath())
        fs.writeFileSync(
            GLOBAL_CONSTANTS.runningFilename(),
            JSON.stringify({ running: true })
        )

        process.on('SIGINT', () => {
            if (currentPhase === MAIN_PROCESS_PHASES.ParsePhase()) {
                process.exit(0)
            }

            logger.log(
                'Start shutdown... next time you can resume this run whit -resume param or start new one'
            )
            fs.writeFileSync(
                GLOBAL_CONSTANTS.runningFilename(),
                JSON.stringify({ running: false })
            )
        })
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
    save: changes => {
        //refresh fields
        info.blockchain = RunSettings.getBlockchain().type_name
        info.logger_path = logger.getPath()
        info.requested_data = RecoverySettings.getRequestedData()
        info.folder_path = RunSettings.getSaveFolderPath()
        info.folder_name = RunSettings.getFolderName()
        info.range = RunSettings.getRange()
        info.phase = currentPhase

        //add format fields
        Object.keys(changes).forEach(key => {
            var find = false
            if (key === 'format') {
                info.format.forEach(f => {
                    if (f.format_name === changes.format.format_name) {
                        find = true
                        format.current_phase = changes.format.current_phase
                    }
                })
                if (!find) {
                    info.format.push(changes.format)
                }
            } else {
                info[key] = changes[key]
            }
        })

        //save
        saveInfo(
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
                GLOBAL_CONSTANTS.infoFilename(),
            info
        )
    },
    terminate: () => {
        fs.unlinkSync(GLOBAL_CONSTANTS.runningFilename())
        logger.log('Shutdown completed', () => process.exit(0))
    }
}
