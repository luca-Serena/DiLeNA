const RUN_SETTINGS = require('./settings/run-settings')

//get date from timestamp
function timestampToDate(timestamp) {
    const date = new Date(timestamp * 1000)
    return (
        date.getUTCDate() +
        '-' +
        (parseInt(date.getUTCMonth()) + 1) +
        '-' +
        date.getUTCFullYear()
    )
}

/*compare two date in DD-MM-YYYY format int as result
 = 0     -> equals
 < 0   -> date1 later
 > 0   -> date2 later
*/
function dateComparator(date1, date2) {
    function process(date) {
        const parts = date.split('-')
        return new Date(parts[2], parts[1] - 1, parts[0])
    }
    return process(date2) - process(date1)
}

module.exports = {
    timestampToDate,
    dateComparator
}
