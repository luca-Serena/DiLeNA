const abstractGenerator = require('./../abstract/abstract-generator')

const FORMAT_CONSTANTS = require('./../../utilities/constants/files-name-constants')
    .FORMAT_CONSTANTS

const { split } = require('./json-splitter')
const { aggregate } = require('./json-aggregator')
const { compose } = require('./json-composer')

abstractGenerator.split = function() {
    split()
}

abstractGenerator.aggregate = function() {
    aggregate()
}

abstractGenerator.compose = function() {
    compose()
}

abstractGenerator.startProcess(FORMAT_CONSTANTS.jsonFormat())
