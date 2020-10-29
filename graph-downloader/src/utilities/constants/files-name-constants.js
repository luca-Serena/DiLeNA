const NO_LAYOUT_CONSTANTS = require('./no-layout-constants').NO_LAYOUT_CONSTANTS

const GLOBAL_CONSTANTS = Object.freeze({
    globalFormat: () => 'common',
    infoFilename: () => 'info.json',
    runningFilename: () => NO_LAYOUT_CONSTANTS.noLayoutPath() + 'running.json'
})

const PAJEK_CONSTANTS = Object.freeze({
    pajekTempFilename: () => 'pajekTemp.net',
    pajekNodesFilename: () => 'nodes.net',
    pajekTransactionsFilename: () => 'transactions.net',
    pajekGraphFilename: () => 'graph.net',
    pajekProcessScriptPath: () => './build/generation/pajek/pajek-generator'
})

const JSON_COSTANTS = Object.freeze({
    jsonTempFilename: () => 'jsonTemp.json',
    jsonNodesFilename: () => 'nodes.json',
    jsonTransactionsFilename: () => 'transactions.json',
    jsonGraphFilename: () => 'graph.json',
    jsonProcessScriptPath: () => './build/generation/json/json-generator'
})

const FORMAT_CONSTANTS = Object.freeze({
    jsonFormat: () => 'Json',
    pajekFormat: () => 'Pajek'
})

module.exports = {
    GLOBAL_CONSTANTS,
    PAJEK_CONSTANTS,
    JSON_COSTANTS,
    FORMAT_CONSTANTS
}
