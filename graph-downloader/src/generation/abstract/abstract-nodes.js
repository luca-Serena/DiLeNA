const _ = require('lodash')
const RBTree = require('bintrees').RBTree
const fs = require('fs')

const FormatSettings = require('./../../utilities/settings/format-settings')
const RecoverySettings = require('./../../utilities/settings/recovery-settings')
const GenerationShutdown = require('./../../shutdown/generation-shutdown')

const ERRORS_MESSAGES = require('./abstract-errors').ERRORS_MESSAGES
const GENERATION_PROCESS_PHASES = require('./../../shutdown/phases')
    .GENERATION_PROCESS_PHASES

const logger = require('./../../utilities/log')
const reader = require('./../reader')
const writer = require('./../writer')

const { checkResourceExists } = require('./../../utilities/file-utils')

nodesPath = ERRORS_MESSAGES.fieldError('abstract-nodes', 'nodesPath')

nodeParser = function(line) {
    throw ERRORS_MESSAGES.functionError('abstract-nodes', 'nodeParser')
}

elemToNode = function(elem) {
    throw ERRORS_MESSAGES.functionError('abstract-nodes', 'elemToNode')
}

function nodesAggregation(filePath, callback) {
    const nodesPath = module.exports.nodesPath

    const currentFile = currentFileInitializer()

    var nodesToWrite

    var nodesFile
    var lastTempRead = false

    var saveLine = 0
    var lastLine =
        filePath === RecoverySettings.getCurrentFilepath() &&
        GENERATION_PROCESS_PHASES.NodesPhase() ===
            RecoverySettings.getCurrentReadPhase()
            ? RecoverySettings.getLastLine()
            : 0

    //check file exist if exist don't create new one or empty nodes created by splitter
    if (!checkResourceExists(nodesPath)) {
        //create file if doesn't exist, need if no previous download
        fs.closeSync(fs.openSync(nodesPath, 'w'))
    }
    nodesFile = nodesInitializer()
    GenerationShutdown.changePhase(GENERATION_PROCESS_PHASES.NodesPhase())
    logger.log(
        'Start ' +
            FormatSettings.getFormat() +
            ' nodes extraction from ' +
            filePath
    )
    currentFile.nextLines()

    function nodesInitializer() {
        return reader(
            nodesPath,
            GENERATION_PROCESS_PHASES.NodesPhase(),
            module.exports.nodeParser,
            (lines, options) => {
                _.flatten(lines).forEach(elem => {
                    if (GenerationShutdown.isRunning()) {
                        nodesToWrite.remove(elem)
                    } else {
                        GenerationShutdown.saveState(saveLine, filePath)
                        GenerationShutdown.terminate()
                    }
                })

                if (options.endFile) {
                    endCurrentFileBlock(() => {
                        if (lastTempRead) {
                            logger.log(
                                'Terminated ' +
                                    FormatSettings.getFormat() +
                                    ' nodes extraction from ' +
                                    filePath
                            )
                            callback()
                        } else {
                            nodesFile = nodesInitializer()
                            currentFile.nextLines()
                        }
                    })
                } else {
                    nodesFile.nextLines()
                }
            }
        )
    }

    function transactionParser(line) {
        const e = JSON.parse(line)
        return [e.source, e.target]
    }

    function currentFileInitializer() {
        return reader(
            filePath,
            GENERATION_PROCESS_PHASES.NodesPhase(),
            transactionParser,
            (lines, options) => {
                treeInitializer()
                _.flatten(lines).forEach(elem => {
                    if (GenerationShutdown.isRunning()) {
                        nodesToWrite.insert(elem)
                    } else {
                        GenerationShutdown.saveState(saveLine, filePath)
                        GenerationShutdown.terminate()
                    }
                })
                lastLine += lines.length
                if (options.endFile) {
                    lastTempRead = true
                }
                nodesFile.nextLines()
            }
        )
    }

    function endCurrentFileBlock(cb) {
        var writeNode = true

        function checkThreshold() {
            if (writeNode) {
                cb()
            }
        }

        if (nodesToWrite.size != 0) {
            writer(nodesPath, writer => {
                const nodesWriter = writer
                writeNode = false
                const app = []
                const it = nodesToWrite.iterator()
                var item
                while ((item = it.next()) !== null) {
                    app.push(item)
                }
                nodesWriter.writeArray(
                    app.map(elem => module.exports.elemToNode(elem) + '\n'),
                    () => {
                        writeNode = true
                        saveLine = lastLine
                        if (GenerationShutdown.isRunning()) {
                            checkThreshold()
                        } else {
                            GenerationShutdown.saveState(saveLine, filePath)
                            GenerationShutdown.terminate()
                        }
                    }
                )
            })
        } else {
            checkThreshold()
        }
    }

    function treeInitializer() {
        nodesToWrite = new RBTree((a, b) => {
            return a.localeCompare(b)
        })
    }
}

module.exports = {
    nodesPath,
    nodeParser,
    elemToNode,
    nodesAggregation
}
