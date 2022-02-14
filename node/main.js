import express from 'express';
import http from 'http';
import cors from 'cors';
import cheerio from 'cheerio';
import request from 'request';


var app = express();
const appserver = http.createServer(app);


app.use(express.json())

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE'
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));

app.get('/test', async(req, res)=>{
    const endpoint = 'https://www.basketball-reference.com/teams/index.html'
    // const endpoint = 'http://localhost:3001/endpoint'
    try {
        request({
            method: 'GET',
            url: endpoint
        }, (err, res, body) => {
            
            console.error(err);
            console.log(res);
            console.log(body);
        
            let $ = cheerio.load(body);
        
            console.log($.html());
        });
    } catch (err) {
      console.error(err)
    }
  })

  app.get('/endpoint', async(req, res)=>{
    try {
        res.send("<h1>all good</h1>");
    } catch (err) {
      console.error(err)
    }
  })


export default appserver