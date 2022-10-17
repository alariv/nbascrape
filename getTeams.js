import cheerio from "cheerio";
import request from "request";

export async function getTeams(url) {
  return new Promise((resolve) => {
    console.log("getting teams from", url);
    request(
      {
        method: "GET",
        url: url,
      },
      (err, response, body) => {
        // console.log(body);
        // console.log(response);
        // console.log(err);
        let $ = cheerio.load(body);

        let links = $(".basketball.force-table tbody a");
        // console.log("links:", links.length);
        let teams = {};
        $(links).each(function (i, link) {
          // console.log("found link:", link);
          if (
            $(link).text() !== "Roster" &&
            $(link).text() !== "Schedule" &&
            $(link).text() !== "Stats"
          ) {
            teams[$(link).text()] = {
              link: $(link).attr("href").substr(1, $(link).attr("href").length),
              teamShort: $(link)
                .attr("href")
                .substr(1, $(link).attr("href").length)
                .split("/")[2],
              teamNumber: $(link)
                .attr("href")
                .substr(1, $(link).attr("href").length)
                .split("/")[3],
            };
          }
        });

        resolve(teams);
      }
    );
  });
}
