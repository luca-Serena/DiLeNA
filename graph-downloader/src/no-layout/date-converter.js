const RUN_SETTINGS = require('../utilities/settings/run-settings')

const { dateComparator } = require('../utilities/date-utils')
var lastBlock

function dateToBlocks(params) {
    const firstBlockDate = RUN_SETTINGS.getBlockchain().first_date

    return RUN_SETTINGS.getBlockchain()
        .last_block_id()
        .then(lastBlock => {
            const r = RUN_SETTINGS.getBlockchain().get_block_time(lastBlock)
            return r
        })
        .then(lastDate => {
            if (
                dateComparator(firstBlockDate, params.firstDate) >= 0 &&
                dateComparator(lastDate, params.lastDate) < 0
            ) {
                return Promise.all([
                    dateToBlock(params.firstDate, PrecisionStandard.FIRST),
                    dateToBlock(params.lastDate, PrecisionStandard.LAST)
                ]).then(values => {
                    return { start: values[0], end: values[1] }
                })
            } else {
                console.log(
                    'Wrong params, firstDate start from ' +
                        firstBlockDate +
                        ' and lastDate before ' +
                        lastDate
                )
                process.exit(1)
            }
        })
}

function allToBlocks() {
    return RUN_SETTINGS.getBlockchain()
        .last_block_id()
        .then(lastBlock => {
            return { start: 0, end: lastBlock }
        })
}

const PrecisionStandard = Object.freeze({
    FIRST: (index, precision) => index - precision,
    LAST: (index, precision) => index + precision
})

//get first index in one date
function dateToBlock(date, PrecisionStandard) {
    return RUN_SETTINGS.getBlockchain()
        .last_block_id()
        .then(lastBlockDate => {
            const range = {
                lowerBound: 0,
                upperBound: lastBlockDate
            }
            return binaryIndexSearch(range, date, PrecisionStandard)
        })
}

//binary search implementation on blockchain
function binaryIndexSearch(range, date, PrecisionStandard) {
    const index = parseInt((range.upperBound + range.lowerBound) / 2)
    return RUN_SETTINGS.getBlockchain()
        .get_block_time(index)
        .then(blockDate => {
            const compare = dateComparator(blockDate, date)
            if (compare == 0) {
                return precisionSearch(index, date, 1000, PrecisionStandard)
            }
            if (compare < 0) {
                range.upperBound = index
                return binaryIndexSearch(range, date, PrecisionStandard)
            }
            if (compare > 0) {
                range.lowerBound = index
                return binaryIndexSearch(range, date, PrecisionStandard)
            }
        })
}

/*Find first or last block index in one date
* index, to check
* date, date to exam
* precision, number of  blocks to skip
* PrecisionStandard, specify if searched last or fist block in day
*
* algorithm compare date with date of previous or next block(dependes on PrecisionStandard, always called nextBlock).
* if is the same pass nextBlock recursively, if date doesn't match try with skipping less blocks,
* if skipping one block change date, this is the last or first block of day, return it.
*/
function precisionSearch(index, date, precision, PrecisionStandard) {
    var nextBlock = PrecisionStandard(index, precision)
    //check to avoid out of bound
    if (nextBlock < 0 || nextBlock > lastBlock) {
        return precisionSearch(
            index,
            date,
            Math.ceil(precision / 10),
            PrecisionStandard
        )
    }
    return RUN_SETTINGS.getBlockchain()
        .get_block_time(nextBlock)
        .then(blockDate => {
            //block 0 timestamp = 0, so it return 01-01-1970, if this happens return 0
            if (dateComparator(blockDate, '01-01-1970') == 0) {
                return 0
            }
            if (dateComparator(blockDate, date) == 0) {
                return precisionSearch(
                    nextBlock,
                    date,
                    precision,
                    PrecisionStandard
                )
            } else {
                if (precision == 1) {
                    return index
                } else {
                    return precisionSearch(
                        index,
                        date,
                        Math.ceil(precision / 10),
                        PrecisionStandard
                    )
                }
            }
        })
}

module.exports = {
    dateToBlocks,
    allToBlocks
}
