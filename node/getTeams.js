import cheerio from 'cheerio'
import request from 'request'

export async function getTeams(url) {
  return new Promise(resolve => {
    request(
      {
        method: 'GET',
        url: url
      },
      (err, response, body) => {
        console.log('finished request')
        //   console.error(err)
        //   console.log(response)
        //   console.log(body)

        let $ = cheerio.load(body)

        let links = $('#teams_active').find('a')
        let teams = {}
        $(links).each(function (i, link) {
          // console.log($(link).text() + ':\n  ' + $(link).attr('href'))
          teams[$(link).text()] = {
            link: $(link).attr('href')
          }
        })

        console.log(teams)
        resolve(teams)
      }
    )
  })
}
