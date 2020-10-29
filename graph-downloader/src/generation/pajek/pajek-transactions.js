const abstractTransactions = require('./../abstract/abstract-transactions')

const PAJEK_CONSTANTS = require('./../../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

function pajekTransactionsAggregation(filePath, cb) {
    const nodesPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekNodesFilename()

    const transactionsPath =
        NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
        PAJEK_CONSTANTS.pajekTransactionsFilename()

    abstractTransactions.path = {
        nodesPath: nodesPath,
        transactionsPath: transactionsPath
    }

    abstractTransactions.nodeFileParser = function(line) {
        const parts = line.split(' ')
        return {
            key: parts[1].replace(/"/g, ''),
            val: parseInt(parts[0])
        }
    }

    abstractTransactions.tempFileParser = function(line) {
        return JSON.parse(line)
    }

    abstractTransactions.transactionConverter = function(transaction, nodes) {
        function getIndex(hashCode) {
            if (typeof hashCode == 'string') {
                const elem = nodes.find({ key: hashCode })
                return elem != null ? elem.val : hashCode
            }
            return hashCode
        }

        transaction.source = getIndex(transaction.source)
        transaction.target = getIndex(transaction.target)
        if (
            typeof transaction.source == 'number' &&
            typeof transaction.target == 'number'
        ) {
            return (
                transaction.source +
                ' ' +
                transaction.target +
                ' ' +
                transaction.amount
            )
        } else {
            return transaction
        }
    }

    abstractTransactions.transactionsAggregation(filePath, cb)
}

module.exports = {
    pajekTransactionsAggregation
}
