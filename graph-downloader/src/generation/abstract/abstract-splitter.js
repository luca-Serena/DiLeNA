const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const GenerationShutdown = require('../../shutdown/generation-shutdown')

const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GENERATION_PROCESS_PHASES = require('./../../shutdown/phases')
    .GENERATION_PROCESS_PHASES

const writer = require('./../writer')
const reader = require('./../reader')
const logger = require('./../../utilities/log')

const { checkResourceExists } = require('./../../utilities/file-utils')

const TYPE = Object.freeze({
    node: 'node',
    transaction: 'transaction'
})

path = {
    graphPath: ERRORS_MESSAGES.fieldError(
        'abstract-splitter',
        'path.graphPath'
    ),
    nodePath: ERRORS_MESSAGES.fieldError('abstract-splitter', 'path.nodePath'),
    transactionPath: ERRORS_MESSAGES.fieldError(
        'abstract-splitter',
        'path.transactionPath'
    )
}

parser = function(line) {
    throw ERRORS_MESSAGES.functionError('abstract-splitter', 'parser')
}

aggregate = function() {
    throw ERRORS_MESSAGES.functionError('abstract-splitter', 'aggregate')
}

function split() {
    GenerationShutdown.changePhase(GENERATION_PROCESS_PHASES.SplitPhase())
    logger.log('Start ' + FormatSettings.getFormat() + ' splitting')

    const graphPath = module.exports.path.graphPath
    const nodePath = module.exports.path.nodePath
    const transactionPath = module.exports.path.transactionPath

    var nodeWriter
    var transactionWriter
    var lastLine = 0

    var writeTerminated = 0
    var callTerminate = false

    if (checkResourceExists(graphPath)) {
        writer(nodePath, nodeW => {
            nodeWriter = nodeW
            writer(transactionPath, transactionW => {
                transactionWriter = transactionW

                const lineReader = reader(
                    graphPath,
                    GENERATION_PROCESS_PHASES.SplitPhase(),
                    line => {
                        return line
                    },
                    (lines, options) => {
                        lines.some(line => {
                            if (GenerationShutdown.isRunning()) {
                                lastLine++
                                addToFile(line)
                            } else {
                                callTerminate = true
                                return true
                            }
                        })
                        if (options.endFile && !callTerminate) {
                            module.exports.aggregate()
                        } else {
                            lineReader.nextLines()
                        }
                    }
                )
                lineReader.nextLines()
            })
        })
    }

    function addToFile(line) {
        const elem = module.exports.parser(line)
        switch (elem.type) {
            case TYPE.node:
                writeElem(nodeWriter, elem.data)
                break
            case TYPE.transaction:
                writeElem(transactionWriter, elem.data)
                break
            default:
                /*
                needed for line not to write (*Verticles, {nodes: [], ...),
                whitout this, writeTerminated !== lastLine and never shutdown
                */
                writeTerminated++
        }
    }

    function writeElem(writer, data) {
        writer.write(data, () => {
            writeTerminated++
            if (writeTerminated === lastLine) {
                terminate()
            }
        })
    }

    function terminate() {
        if (callTerminate) {
            GenerationShutdown.saveState(
                lastLine + RecoverySettings.getLastLine(),
                graphPath
            )
            GenerationShutdown.terminate()
        }
    }
}

module.exports = {
    path,
    parser,
    aggregate,
    TYPE,
    split
}
