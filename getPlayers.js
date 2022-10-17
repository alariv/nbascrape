import cheerio from "cheerio";
import request from "request";

export async function getPlayers(url, teams) {
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      let teamShort = teams[team].teamShort;
      let teamNumber = teams[team].teamNumber;
      const currentDate = new Date();
      let yearToFetch =
        currentDate.getMonth() < 8
          ? new Date().getFullYear().toString()
          : (new Date().getFullYear() + 1).toString();
      request(
        {
          method: "GET",
          url: url
            .replace("{{teamShort}}", teamShort)
            .replace("{{teamNumber}}", teamNumber)
            .replace("{{year}}", yearToFetch),
        },
        (err, response, body) => {
          counter += 1;

          let $ = cheerio.load(body);

          let rows = $("table.tablesaw tbody").find("tr");

          // console.log("PLAYERS ROWS LENGTH", rows.length);
          let players = {};

          $(rows).each(function (i, row) {
            if ($(row).find("td[data-th=Player]").text()) {
              players[$(row).find("td[data-th=Player]").find("a").text()] = {
                link: $(row)
                  .find("td[data-th=Player]")
                  .find("a")
                  .attr("href")
                  .substr(
                    1,
                    $(row).find("td[data-th=Player]").find("a").attr("href")
                      .length
                  ),
                pos: $(row).find("td[data-th=Pos]").text(),
              };
            }
          });

          teams[team] = { ...teams[team], players: players };

          request(
            {
              method: "GET",
              url: url
                .replace("{{teamShort}}", teamShort)
                .replace("{{teamNumber}}", teamNumber)
                .replace("{{year}}", (parseInt(yearToFetch) - 1).toString()),
            },
            (err, response, body) => {
              counter += 1;

              let $ = cheerio.load(body);

              let rows = $("table.tablesaw tbody").find("tr");
              let oldPlayers = {};

              $(rows).each(function (i, row) {
                if (
                  $(row).find("td[data-th=Player]").text() &&
                  !Object.keys(teams[team].players).includes(
                    $(row).find("td[data-th=Player]").text()
                  )
                ) {
                  console.log(
                    `${team} old player ${$(row)
                      .find("td[data-th=Player]")
                      .text()}`
                  );
                  oldPlayers[$(row).find("td[data-th=Player]").text()] = {
                    link: $(row)
                      .find("td[data-th=Player]")
                      .find("a")
                      .attr("href")
                      .substr(
                        1,
                        $(row).find("td[data-th=Player]").find("a").attr("href")
                          .length
                      ),
                    pos: $(row).find("td[data-th=Pos]").text(),
                  };
                }
              });

              teams[team] = {
                ...teams[team],
                previousSeasonPlayers: oldPlayers,
              };

              if (counter == Object.keys(teams).length * 2) {
                resolve(teams);
              }
            }
          );
        }
      );
    });
  });
}
