const abstractSplitter = require('./../abstract/abstract-splitter')

const PAJEK_CONSTANTS = require('./../../utilities/constants/files-name-constants')
    .PAJEK_CONSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

const { aggregate } = require('./pajek-aggregator')

function split() {
    abstractSplitter.path = {
        graphPath:
            NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
            PAJEK_CONSTANTS.pajekGraphFilename(),

        nodePath:
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
            PAJEK_CONSTANTS.pajekNodesFilename(),

        transactionPath:
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
            PAJEK_CONSTANTS.pajekTransactionsFilename()
    }

    abstractSplitter.parser = function(line) {
        var type = 'error'
        var data = undefined
        if (!line.includes('*')) {
            if (line.split(' ').length == 2) {
                type = abstractSplitter.TYPE.node
            } else if (line.split(' ').length == 3) {
                type = abstractSplitter.TYPE.transaction
            }
            data = line + '\n'
        }
        return {
            type: type,
            data: data
        }
    }

    abstractSplitter.aggregate = function() {
        aggregate()
    }

    abstractSplitter.split()
}

module.exports = {
    split
}
