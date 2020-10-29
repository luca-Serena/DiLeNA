const LineByLineReader = require('line-by-line')
const execSync = require('child_process').execSync
const SpecSettings = require('../utilities/settings/spec-settings')
const RecoverySettings = require('../utilities/settings/recovery-settings')

module.exports = (filepath, phase, parseLogic, callback) => {
    /*there is a proportion of 4500000 of lines for each 1400 MB, this params as been tuned.
    This number should be divided for three, nodes file, transactions file and writer buffer.
    So nodes and transactions readers can read 1250000 lines each.*/
    const tunedMemory = 1400
    const tunedLines = 1250000
    /*
    chunkSize is the number of lines for each block, it is a proportion, 2500000 for 1000 mb for available memory 
    */
    const chunkSize = Math.ceil(
        tunedLines * SpecSettings.getProcessMemory() / tunedMemory
    )
    const linesNumber = parseInt(execSync('wc -l < ' + filepath).toString())
    const blocks =
        filepath === RecoverySettings.getCurrentFilepath() &&
        phase === RecoverySettings.getCurrentReadPhase()
            ? Math.ceil(
                  (linesNumber - RecoverySettings.getLastLine()) / chunkSize
              )
            : Math.ceil(linesNumber / chunkSize)
    var reader
    var blocksReaded = 0
    var readedLine = 0
    var lines = []

    var skippedLine = 0

    function initialization() {
        reader = new LineByLineReader(filepath)
        reader.pause()
        reader.on('line', function(line) {
            if (
                skippedLine < RecoverySettings.getLastLine() &&
                filepath === RecoverySettings.getCurrentFilepath() &&
                phase === RecoverySettings.getCurrentReadPhase()
            ) {
                skippedLine++
            } else {
                const elements = parseLogic(line)
                lines.push(elements)
                readedLine++
                const remainingLines =
                    filepath === RecoverySettings.getCurrentFilepath() &&
                    phase === RecoverySettings.getCurrentReadPhase()
                        ? linesNumber -
                          RecoverySettings.getLastLine() -
                          blocksReaded * chunkSize
                        : linesNumber - blocksReaded * chunkSize

                if (
                    readedLine ==
                    (remainingLines > chunkSize ? chunkSize : remainingLines)
                ) {
                    blocksReaded++
                    readedLine = 0
                    reader.pause()
                    const copy = lines
                    lines = []
                    if (blocksReaded == blocks) {
                        callback(copy, { endFile: true })
                    } else {
                        callback(copy, { endFile: false })
                    }
                }
            }
        })
    }

    initialization()

    function nextLines() {
        if (linesNumber == 0) {
            callback([], { endFile: true })
        } else {
            reader.resume()
        }
    }

    return {
        nextLines
    }
}
