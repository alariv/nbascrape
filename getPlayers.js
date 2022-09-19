import cheerio from "cheerio";
import request from "request";

export async function getPlayers(url, teams) {
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      let teamShort = teams[team].teamShort;
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
            .replace("{{year}}", yearToFetch),
        },
        (err, response, body) => {
          counter += 1;

          let $ = cheerio.load(body);

          let rows = $("#roster").find("tr");
          let players = {};

          $(rows).each(function (i, row) {
            if ($(row).find("td[data-stat=player]").text()) {
              players[$(row).find("td[data-stat=player]").find("a").text()] = {
                link: $(row)
                  .find("td[data-stat=player]")
                  .find("a")
                  .attr("href")
                  .substr(
                    1,
                    $(row).find("td[data-stat=player]").find("a").attr("href")
                      .length
                  ),
                pos: $(row).find("td[data-stat=pos]").text(),
              };
            }
          });

          teams[team] = { ...teams[team], players: players };

          if (counter == Object.keys(teams).length) {
            resolve(teams);
          }
        }
      );
    });
  });
}
