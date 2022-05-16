import cheerio from 'cheerio';
import request from 'request';

export async function getPlayersStats(teams, baseUrl) {
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      console.log('in getPlayerStats for team', team);
      Object.keys(teams[team].players).map((player, idx) => {
        console.log('making request for', player);
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
            teams[team].players[player] = {
              ...teams[team].players[player],
              playerData: playerData
            };
            console.log('player:', player, playerData);
            if (counter == Object.keys(teams[team].players).length) {
              console.log('resolving for some reason');
              resolve(teams);
            } else {
              console.log('counter ==', counter);
              console.log(
                'teams[team].players.length ==',
                Object.keys(teams[team].players).length
              );
            }
          }
        );
      });
    });
  });
}
