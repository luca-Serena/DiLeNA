const abstractSplitter = require('./../abstract/abstract-splitter')

const JSON_COSTANTS = require('./../../utilities/constants/files-name-constants')
    .JSON_COSTANTS
const NO_LAYOUT_CONSTANTS = require('./../../utilities/constants/no-layout-constants')
    .NO_LAYOUT_CONSTANTS

const { aggregate } = require('./json-aggregator')

function split() {
    abstractSplitter.path = {
        graphPath:
            NO_LAYOUT_CONSTANTS.noLayoutAllPath() +
            JSON_COSTANTS.jsonGraphFilename(),

        nodePath:
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
            JSON_COSTANTS.jsonNodesFilename(),

        transactionPath:
            NO_LAYOUT_CONSTANTS.noLayoutTemporaryPath() +
            JSON_COSTANTS.jsonTransactionsFilename()
    }

    abstractSplitter.parser = function(line) {
        try {
            var type = 'error'

            const parsableElem =
                line[line.length - 1] === ',' ? line.slice(0, -1) : line
            const data = JSON.parse(parsableElem)
            if (data.id != undefined) {
                type = abstractSplitter.TYPE.node
            } else if (data.source != undefined) {
                type = abstractSplitter.TYPE.transaction
            }
            return {
                type: type,
                data: JSON.stringify(data) + '\n'
            }
        } catch (err) {
            //here will be some lines of json utilities (ex. {"nodes":[)
            return {
                type: 'error',
                data: undefined
            }
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
