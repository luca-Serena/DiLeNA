const fs = require('fs')
const GLOBAL_CONSTANTS = require('./../utilities/constants/files-name-constants')
    .GLOBAL_CONSTANTS

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
    terminate: () => {
        process.disconnect()
        process.exit(0)
    }
}
