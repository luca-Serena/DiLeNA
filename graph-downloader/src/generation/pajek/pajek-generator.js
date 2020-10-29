const abstractGenerator = require('./../abstract/abstract-generator')

const FORMAT_CONSTANTS = require('./../../utilities/constants/files-name-constants')
    .FORMAT_CONSTANTS

const { split } = require('./pajek-splitter')
const { aggregate } = require('./pajek-aggregator')
const { compose } = require('./pajek-composer')

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.compose = function() {
    compose()
}

abstractGenerator.startProcess(FORMAT_CONSTANTS.pajekFormat())
