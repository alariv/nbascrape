import cheerio from 'cheerio';
import request from 'request';

export async function getTeams(url) {
  return new Promise((resolve) => {
    // console.log('getTeams start')
    // console.log('url', url);
    request(
      {
        method: 'GET',
        url: url
      },
      (err, response, body) => {
        // console.log('finished getTeams request from', url);
        //   console.error(err)
        //   console.log(response)
        // console.log(body)

        let $ = cheerio.load(body);

        let links = $('#teams_active').find('a');
        let teams = {};
        $(links).each(function (i, link) {
          // console.log($(link).text() + ':\n  ' + $(link).attr('href'))
          teams[$(link).text()] = {
            link: $(link).attr('href').substr(1, $(link).attr('href').length)
          };
        });

        // console.log(teams);
        resolve(teams);
      }
    );
  });
}
