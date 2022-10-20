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
            // console.log(response);
            let rows = $(".main-container table").eq(0).find("tbody tr.per_game");
            console.log(
              "asking player",
              player,
              " data. rows len",
              rows.length,'link:',baseUrl + teams[team].players[player].link
            );
            let playerData = {};
            $(rows).each(function (i, row) {
              if ($(row).find("td").eq(0).text()) {
                
            console.log($(row).find("td").eq(0).text());
                playerData[$(row).find("td").eq(0).text().split(" ")[0]] = {
                  link:
                    baseUrl +
                    teams[team].players[player].link.replace(
                      "Summary",
                      "GameLogs"
                    ) +
                    "/NBA/20" +
                    $(row).find("td").eq(0).text().split("-")[1].split(" ")[0],
                };
              }
            });
            teams[team].players[player] = {
              ...teams[team].players[player],
              playerData: playerData,
            };
            if (counter == Object.keys(teams[team].players).length) {
              if (
                Object.keys(teams[team]?.previousSeasonPlayers || {}).length
              ) {
                Object.keys(teams[team].previousSeasonPlayers).map(
                  (player, idx) => {
                    request(
                      {
                        method: "GET",
                        url:
                          baseUrl +
                          teams[team].previousSeasonPlayers[player].link,
                      },
                      (err, response, body) => {
                        counter += 1;
                        if (!body || typeof body !== "string") return;
                        let $ = cheerio.load(body);
                        let rows = $(".main-container table").eq(0).find("tbody tr.per_game");
                        let playerData = {};
                        $(rows).each(function (i, row) {
                          if ($(row).find("td").eq(0).text()) {
                            playerData[
                              $(row).find("td").eq(0).text().split(" ")[0]
                            ] = {
                              link:
                                baseUrl +
                                teams[team].previousSeasonPlayers[
                                  player
                                ].link.replace("Summary", "GameLogs") +
                                "/NBA/20" +
                                $(row)
                                  .find("td")
                                  .eq(0)
                                  .text()
                                  .split("-")[1]
                                  .split(" ")[0],
                            };
                          }
                        });
                        teams[team].previousSeasonPlayers[player] = {
                          ...teams[team].previousSeasonPlayers[player],
                          playerData: playerData,
                        };
                        if (
                          counter ==
                          Object.keys(teams[team].players).concat(
                            Object.keys(teams[team].previousSeasonPlayers)
                          ).length
                        ) {
                          console.log(
                            "resolving - all players and previousSeasonPlayers data collected"
                          );
                          resolve(teams);
                        }
                      }
                    );
                  }
                );
              } else {
                console.log("resolving - all players data collected");
                resolve(teams);
              }
            }
          }
        );
      });
    });
  });
}
