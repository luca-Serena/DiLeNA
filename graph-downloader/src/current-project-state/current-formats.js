const JSON_COSTANTS = require('../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const PAJEK_CONSTANTS = require('../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS
const FORMAT_CONSTANTS = require('../utilities/constants/files-name-constants')
    .FORMAT_CONSTANTS

const CURRENT_FORMATS = Object.freeze({
    json: {
        name: FORMAT_CONSTANTS.jsonFormat(),
        process: JSON_COSTANTS.jsonProcessScriptPath(),
        graph: JSON_COSTANTS.jsonGraphFilename()
    },
    pajek: {
        name: FORMAT_CONSTANTS.pajekFormat(),
        process: PAJEK_CONSTANTS.pajekProcessScriptPath(),
        graph: PAJEK_CONSTANTS.pajekGraphFilename()
    }
})

module.exports = {
    CURRENT_FORMATS
}
