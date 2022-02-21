import cheerio from 'cheerio'
import request from 'request'

export async function getPlayers(url, teams) {
  console.log(`getting ${Object.keys(teams).length} teams players`)
  let counter = 0
  return new Promise(resolve => {
    Object.keys(teams).map((team, idx) => {
      request(
        {
          method: 'GET',
          url: url.replace('{{teamUrl}}', teams[team].link.slice(1))
        },
        (err, response, body) => {
          counter += 1
          console.log('finished players request')
          //   console.error(err)
          //   console.log(response)
          //   console.log(body)

          let $ = cheerio.load(body)

          let links = $('#franchise_register').find('a')
          let players = {}
          $(links).each(function (i, link) {
            // console.log($(link).text() + ':\n  ' + $(link).attr('href'))
            if (i > 20) return
            players[$(link).text()] = {
              link: $(link).attr('href')
            }
          })

          teams[team] = {...teams[team], players: players}

          console.log(players)

          if (counter == Object.keys(teams).length) {
            resolve(teams)
          }
        }
      )
    })
  })
}
