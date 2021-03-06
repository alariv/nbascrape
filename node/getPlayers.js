import cheerio from 'cheerio';
import request from 'request';

export async function getPlayers(url, teams) {
  // console.log(`getting ${Object.keys(teams).length} teams players`)

  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      let teamShort = teams[team].link.split('/')[1];
      // console.log(
      //   url
      //     .replace('{{teamShort}}', teamShort)
      //     .replace('{{year}}', new Date().getFullYear().toString())
      // );

      request(
        {
          method: 'GET',
          url: url
            .replace('{{teamShort}}', teamShort)
            .replace('{{year}}', new Date().getFullYear().toString())
        },
        (err, response, body) => {
          counter += 1;
          // console.log('finished', team, 'players request');
          //   console.error(err)
          //   console.log(response)
          // console.log(body)

          let $ = cheerio.load(body);

          let rows = $('#roster').find('tr');
          let players = {};

          $(rows).each(function (i, row) {
            if ($(row).find('td[data-stat=player]').text()) {
              players[$(row).find('td[data-stat=player]').find('a').text()] = {
                link: $(row)
                  .find('td[data-stat=player]')
                  .find('a')
                  .attr('href')
                  .substr(
                    1,
                    $(row).find('td[data-stat=player]').find('a').attr('href')
                      .length
                  ),
                pos: $(row).find('td[data-stat=pos]').text()
              };
            }
          });

          teams[team] = { ...teams[team], players: players };

          // console.log(players);
          if (counter == Object.keys(teams).length) {
            // console.log(teams);
            resolve(teams);
          }
        }
      );
    });
  });
}
