import cheerio from "cheerio";
import request from "request";

export async function getTeamsShorts(url, teams) {
  let counter = 0;
  return new Promise((resolve) => {
    Object.keys(teams).map((team, idx) => {
      let teamShort = teams[team].link.split("/")[1];
      request(
        {
          method: "GET",
          url: url.replace("index.html", teamShort),
        },
        (err, response, body) => {
          counter += 1;

          let $ = cheerio.load(body);

          let currentTeamShort = $(`#${teamShort}`)
            .find("th[data-stat=season]")
            .find("a")
            .attr("href")
            .split("/")[2];

          teams[team] = {
            ...teams[team],
            teamShort: currentTeamShort,
          };
          if (counter == Object.keys(teams).length) {
            console.log("resolving - all teams shorts collected");
            resolve(teams);
          }
        }
      );
    });
  });
}
