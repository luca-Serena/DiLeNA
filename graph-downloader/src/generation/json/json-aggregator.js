const abstractAggregator = require('./../abstract/abstract-aggregator')

const { jsonNodesAggregation } = require('./json-nodes')
const { jsonTransactionsAggregation } = require('./json-transactions')
const { compose } = require('./json-composer')

function aggregate() {
    abstractAggregator.nodesAggregation = function(filepath, cb) {
        jsonNodesAggregation(filepath, cb)
    }

    abstractAggregator.transactionsAggregation = function(filepath, cb) {
        jsonTransactionsAggregation(filepath, cb)
    }

    abstractAggregator.compose = function() {
        compose()
    }

    abstractAggregator.aggregate()
}

module.exports = {
    aggregate
}
