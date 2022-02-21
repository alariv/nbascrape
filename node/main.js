import express from 'express'
import http from 'http'
import cors from 'cors'
import cheerio from 'cheerio'
import request from 'request'
import fs from 'fs'
import {getTeams} from './getTeams.js'
import {getPlayers} from './getPlayers.js'

var app = express()
const appserver = http.createServer(app)
const baseUrl = 'https://www.basketball-reference.com/'
const teamsHtml = `${baseUrl}teams/index.html`
const playersHtml = `${baseUrl}{{teamUrl}}players.html`

app.use(express.json())

const corsOpts = {
  origin: '*',

  methods: ['GET', 'POST', 'PUT', 'DELETE'],

  allowedHeaders: ['Content-Type']
}

app.use(cors(corsOpts))

app.get('/updateTeamsData', async (req, res) => {
  console.log('landed on /updateTeamsData')
  try {
    getTeams(teamsHtml).then(teams => {
      getPlayers(playersHtml, teams).then(teamsWithPlayers => {
        teams = teamsWithPlayers
        fs.writeFile('../src/scrapedData/teams.json', JSON.stringify(teams), function (err, data) {
          if (!err) {
            return console.log('succesfully wrote file')
          } else {
            return console.log(err)
          }
        })
        res.send({status: 'FETCHED'})
      })
    })
  } catch (err) {
    console.error(err)
    res.send(err)
  }
})

app.get('/endpoint', async (req, res) => {
  try {
    res.send('<h1>all good</h1>')
  } catch (err) {
    console.error(err)
  }
})

export default appserver
