const RunSettings = require('../../utilities/settings/run-settings')
const SpecSettings = require('../../utilities/settings/spec-settings')
const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const GenerationShutdown = require('../../shutdown/generation-shutdown')

const GLOBAL_PROCESS_COMMAND = require('./../../utilities/process')
    .GLOBAL_PROCESS_COMMAND
const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GENERATION_PROCESS_PHASES = require('./../../shutdown/phases')
    .GENERATION_PROCESS_PHASES

const logger = require('../../utilities/log')

split = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'split')
}

aggregate = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'aggregate')
}

compose = function() {
    throw ERRORS_MESSAGES.functionError('abstract-generator', 'compose')
}

function startProcess(formatName) {
    FormatSettings.setFormat(formatName)

    process.on('message', function(message) {
        switch (message.command) {
            case GLOBAL_PROCESS_COMMAND.startCommand():
                //global settings
                GenerationShutdown.setShutdownBehaviour()

                logger.setPath(message.data.loggerPath)
                RunSettings.setSaveFolderPath(message.data.saveFolder)
                RunSettings.setFolderName(message.data.folderName)
                RunSettings.setRange(message.data.range)
                SpecSettings.setProcessMemory(message.data.memory)

                if (message.data.resumeData === undefined) {
                    if (message.data.oldDownload) {
                        module.exports.split()
                    } else {
                        module.exports.aggregate()
                    }
                } else {
                    //resume case
                    RecoverySettings.setCurrentReadPhase(
                        message.data.resumeData.phase
                    )
                    RecoverySettings.setLastLine(
                        message.data.resumeData.last_line
                    )
                    RecoverySettings.setCurrentFilepath(
                        message.data.resumeData.file_path
                    )

                    switch (message.data.resumeData.phase) {
                        case GENERATION_PROCESS_PHASES.SplitPhase():
                            module.exports.split()
                            break
                        case GENERATION_PROCESS_PHASES.NodesPhase():
                        case GENERATION_PROCESS_PHASES.TransactionsPhase():
                            module.exports.aggregate()
                            break
                        case GENERATION_PROCESS_PHASES.ComposeNodesPhase():
                        case GENERATION_PROCESS_PHASES.ComposeTransactionsPhase():
                            module.exports.compose()
                            break
                    }
                }

                break
            case GLOBAL_PROCESS_COMMAND.endCommand():
                GenerationShutdown.terminate()
                break
            default:
                logger.error(
                    '[child ' +
                        process.pid +
                        '] received wrong command + ' +
                        message.command
                )
        }
    })
}

module.exports = {
    split,
    aggregate,
    compose,
    startProcess
}
