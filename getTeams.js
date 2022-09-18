import cheerio from "cheerio";
import request from "request";

export async function getTeams(url) {
  return new Promise((resolve) => {
    request(
      {
        method: "GET",
        url: url,
      },
      (err, response, body) => {
        let $ = cheerio.load(body);

        let links = $("#teams_active").find("a");
        let teams = {};
        $(links).each(function (i, link) {
          teams[$(link).text()] = {
            link: $(link).attr("href").substr(1, $(link).attr("href").length),
          };
        });

        resolve(teams);
      }
    );
  });
}
