import cheerio from 'cheerio';
import request from 'request';

export async function getPlayersStats(teams, baseUrl) {
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      Object.keys(teams[team].players).map((player, idx) => {
        request(
          {
            method: 'GET',
            url: baseUrl + teams[team].players[player].link
          },
          (err, response, body) => {
            counter += 1;
            console.log('finished', team, 'players request');
            //   console.error(err)
            //   console.log(response)
            // console.log(body)
            if (!body || typeof body !== 'string') return;
            let $ = cheerio.load(body);
            let rows = $('#per_game').find('tr');
            let playerData = {};
            $(rows).each(function (i, row) {
              if ($(row).find('th[data-stat=season]').find('a').attr('href')) {
                playerData[$(row).find('th[data-stat=season]').text()] = {
                  link: $(row)
                    .find('th[data-stat=season]')
                    .find('a')
                    .attr('href')
                };
              }
            });
            teams[team][player] = {
              ...teams[team][player],
              playerData: playerData
            };
            console.log('player:', player, playerData);
          }
        );
      });
      if (counter == Object.keys(teams).length) {
        console.log('resolving for some reason');
        resolve(teams);
      }
    });
  });
}
