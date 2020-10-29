const abstractTransactions = require('./../abstract/abstract-transactions')

const JSON_COSTANTS = require('./../../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

function jsonTransactionsAggregation(filePath, cb) {
    abstractTransactions.path = {
        nodesPath:
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
            JSON_COSTANTS.jsonNodesFilename(),

        transactionsPath:
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
            JSON_COSTANTS.jsonTransactionsFilename()
    }

    abstractTransactions.nodeFileParser = function(line) {
        return { key: line }
    }

    abstractTransactions.tempFileParser = function(line) {
        return line
    }

    abstractTransactions.transactionConverter = function(transaction, nodes) {
        return transaction
    }

    abstractTransactions.transactionsAggregation(filePath, cb)
}

module.exports = {
    jsonTransactionsAggregation
}
