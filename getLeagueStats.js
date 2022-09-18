import cheerio from "cheerio";
import request from "request";

export async function getLeagueStats(url) {
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
      request(
        {
          method: "GET",
          url: url.replace("{{year}}", years[idx]),
        },
        (err, response, body) => {
          counter += 1;

          let $ = cheerio.load(body);

          let rows = $("#totals-opponent").find("tr");

          teamsStats[years[idx]] = {};
          $(rows).each(function (i, row) {
            if (
              $(row).find("td[data-stat=team]").find("a").text() ||
              $(row).find("td[data-stat=team]").text()
            ) {
              teamsStats[years[idx]][
                $(row).find("td[data-stat=team]").find("a").text() ||
                  $(row).find("td[data-stat=team]").text()
              ] = {
                g:
                  $(row).find("td[data-stat=g]").text() ||
                  $(row).find("td[data-stat=g]").text(),
                mp:
                  $(row).find("td[data-stat=mp]").text() ||
                  $(row).find("td[data-stat=mp]").text(),
                fg:
                  $(row).find("td[data-stat=opp_fg]").text() ||
                  $(row).find("td[data-stat=fg]").text(),
                fga:
                  $(row).find("td[data-stat=opp_fga]").text() ||
                  $(row).find("td[data-stat=fga]").text(),
                fg_pct:
                  $(row).find("td[data-stat=opp_fg_pct]").text() ||
                  $(row).find("td[data-stat=fg_pct]").text(),
                fg3:
                  $(row).find("td[data-stat=opp_fg3]").text() ||
                  $(row).find("td[data-stat=fg3]").text(),
                fg3a:
                  $(row).find("td[data-stat=opp_fg3a]").text() ||
                  $(row).find("td[data-stat=fg3a]").text(),
                fg3_pct:
                  $(row).find("td[data-stat=opp_fg3_pct]").text() ||
                  $(row).find("td[data-stat=fg3_pct]").text(),
                fg2:
                  $(row).find("td[data-stat=opp_fg2]").text() ||
                  $(row).find("td[data-stat=fg2]").text(),
                fg2a:
                  $(row).find("td[data-stat=opp_fg2a]").text() ||
                  $(row).find("td[data-stat=fg2a]").text(),
                fg2_pct:
                  $(row).find("td[data-stat=opp_fg2_pct]").text() ||
                  $(row).find("td[data-stat=fg2_pct]").text(),
                ft:
                  $(row).find("td[data-stat=opp_ft]").text() ||
                  $(row).find("td[data-stat=ft]").text(),
                fta:
                  $(row).find("td[data-stat=opp_fta]").text() ||
                  $(row).find("td[data-stat=fta]").text(),
                ft_pct:
                  $(row).find("td[data-stat=opp_ft_pct]").text() ||
                  $(row).find("td[data-stat=ft_pct]").text(),
                orb:
                  $(row).find("td[data-stat=opp_orb]").text() ||
                  $(row).find("td[data-stat=orb]").text(),
                drb:
                  $(row).find("td[data-stat=opp_drb]").text() ||
                  $(row).find("td[data-stat=drb]").text(),
                trb:
                  $(row).find("td[data-stat=opp_trb]").text() ||
                  $(row).find("td[data-stat=trb]").text(),
                ast:
                  $(row).find("td[data-stat=opp_ast]").text() ||
                  $(row).find("td[data-stat=ast]").text(),
                stl:
                  $(row).find("td[data-stat=opp_stl]").text() ||
                  $(row).find("td[data-stat=stl]").text(),
                blk:
                  $(row).find("td[data-stat=opp_blk]").text() ||
                  $(row).find("td[data-stat=blk]").text(),
                tov:
                  $(row).find("td[data-stat=opp_tov]").text() ||
                  $(row).find("td[data-stat=tov]").text(),
                pf:
                  $(row).find("td[data-stat=opp_pf]").text() ||
                  $(row).find("td[data-stat=pf]").text(),
                pts:
                  $(row).find("td[data-stat=opp_pts]").text() ||
                  $(row).find("td[data-stat=pts]").text(),
              };
            }
          });

          if (counter == Object.keys(years).length) {
            resolve(teamsStats);
          }
        }
      );
    });
  });
}
