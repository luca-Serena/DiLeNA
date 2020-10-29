const abstractAggregator = require('./../abstract/abstract-aggregator')

const { pajekNodesAggregation } = require('./pajek-nodes')
const { pajekTransactionsAggregation } = require('./pajek-transactions')
const { compose } = require('./pajek-composer')

function aggregate() {
    abstractAggregator.nodesAggregation = function(filepath, cb) {
        pajekNodesAggregation(filepath, cb)
    }

    abstractAggregator.transactionsAggregation = function(filepath, cb) {
        pajekTransactionsAggregation(filepath, cb)
    }

    abstractAggregator.compose = function() {
        compose()
    }

    abstractAggregator.aggregate()
}

module.exports = {
    aggregate
}
