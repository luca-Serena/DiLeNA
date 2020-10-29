const express = require('express')
const fs = require('mz/fs')


const { ensureDirExists } = require('./../utilities/file-utils')
const logger = require('./../utilities/log')

const LIVE_CONSTANTS = require('./../utilities/constants/live-constants')
    .LIVE_CONSTANTS

logger.setPath(LIVE_CONSTANTS.logLayoutServer() + 'server.log')

const app = express()
const port = 8888

ensureDirExists('./graphs/')

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://www.devid.io')
    res.header('Access-Control-Allow-Methods', 'GET')
    next()
})

app.use('/graphs', express.static('graphs'))

app.get('/graphs', async (req, res) => {
    logger.log('/graphs request')

    try {
        const folders = await fs.readdir('./graphs')
        const listPromises = folders.map(async folder => {
            const subfolders = await fs.readdir(`./graphs/${folder}`)
            return { [folder]: subfolders }
        })
        const list = await Promise.all(listPromises)
        const response = list.reduce(
            (acc, curr) => ({
                ...acc,
                ...curr
            }),
            {}
        )
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(response))
    } catch (err) {
        logger.error(err)
        res.status(500)
        res.send('Internal server error')
    }
})

app.listen(port, () => {
    logger.log(`Web server listening on port ${port}`)
    logger.log('Available APIs:')
    logger.log('/graphs')
    logger.log('/graphs/layout/eth-x/y/{ graph.json , graph.net }')
    logger.log(
        '/graphs/layout/eth-x/y/ngraph/{ labels.json , links.bin , meta.json , positions.bin }'
    )
    logger.log(
        '/graphs/no-layout/block/firstBlock-lastBlock/{ graph.json , graph.net }'
    )
    logger.log(
        '/graphs/no-layout/time/firstDate-lastDate/{ graph.json , graph.net }'
    )
    logger.log('/graphs/no-layout/all/{ graph.json , graph.net }')
})
