import cheerio from "cheerio";
import request from "request";

export async function getPlayersStats(teams, baseUrl) {
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      Object.keys(teams[team].players).map((player, idx) => {
        request(
          {
            method: "GET",
            url: baseUrl + teams[team].players[player].link,
          },
          (err, response, body) => {
            counter += 1;
            if (!body || typeof body !== "string") return;
            let $ = cheerio.load(body);
            let rows = $("#per_game").find("tr");
            let playerData = {};
            $(rows).each(function (i, row) {
              if ($(row).find("th[data-stat=season]").find("a").attr("href")) {
                playerData[$(row).find("th[data-stat=season]").text()] = {
                  link: $(row)
                    .find("th[data-stat=season]")
                    .find("a")
                    .attr("href"),
                };
              }
            });
            teams[team].players[player] = {
              ...teams[team].players[player],
              playerData: playerData,
            };
            if (counter == Object.keys(teams[team].players).length) {
              console.log("resolving - all players data collected");
              resolve(teams);
            }
          }
        );
      });
    });
  });
}
