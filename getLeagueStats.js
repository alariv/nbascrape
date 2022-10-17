import cheerio from "cheerio";
import request from "request";

export async function getLeagueStats(url, teams) {
  const years = [
    (new Date().getFullYear() - 2).toString(),
    (new Date().getFullYear() - 1).toString(),
    new Date().getFullYear().toString(),
    (new Date().getFullYear() + 1).toString(),
  ];
  let teamsStats = {};
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(years).map((year, idx) => {
      Object.keys(teams).map((team, teamIndex) => {
        request(
          {
            method: "GET",
            url: url
              .replace("{{year}}", years[idx])
              .replace("{{teamShort}}", teams[team].teamShort)
              .replace("{{teamNumber}}", teams[team].teamNumber),
          },
          (err, response, body) => {
            counter += 1;

            let $ = cheerio.load(body);

            let rows = $("table").find('td[rel="Opponent Totals"]');
            // console.log("got row?", !!rows.length);

            teamsStats[years[idx]] = { ...teamsStats[years[idx]] };
            $(rows).each(function (i, row) {
              if ($(row).parent().find("td").length) {
                teamsStats[years[idx]][team] = {
                  g: $(row).parent().find("td").eq(1).text(),
                  mp: $(row).parent().find("td").eq(2).text(),
                  fg: $(row).parent().find("td").eq(4).text(),
                  fga: $(row).parent().find("td").eq(5).text(),
                  fg_pct: $(row).parent().find("td").eq(6).text(),
                  fg3: $(row).parent().find("td").eq(7).text(),
                  fg3a: $(row).parent().find("td").eq(8).text(),
                  fg3_pct: $(row).parent().find("td").eq(9).text(),
                  fg2: $(row).parent().find("td").eq(10).text(),
                  fg2a: $(row).parent().find("td").eq(11).text(),
                  fg2_pct: $(row).parent().find("td").eq(12).text(),
                  ft: $(row).parent().find("td").eq(10).text(),
                  fta: $(row).parent().find("td").eq(11).text(),
                  ft_pct: $(row).parent().find("td").eq(12).text(),
                  orb: $(row).parent().find("td").eq(13).text(),
                  drb: $(row).parent().find("td").eq(14).text(),
                  trb: $(row).parent().find("td").eq(15).text(),
                  ast: $(row).parent().find("td").eq(16).text(),
                  stl: $(row).parent().find("td").eq(17).text(),
                  blk: $(row).parent().find("td").eq(18).text(),
                  tov: $(row).parent().find("td").eq(20).text(),
                  pf: $(row).parent().find("td").eq(19).text(),
                  pts: $(row).parent().find("td").eq(3).text(),
                };
              }
            });

            if (
              counter ==
              Object.keys(years).length * Object.keys(teams).length
            ) {
              resolve(teamsStats);
            } else {
              // console.log(
              //   "not resolving, counter:",
              //   counter,
              //   "/",
              //   Object.keys(years).length * Object.keys(teams).length
              // );
            }
          }
        );
      });
    });
  });
}
