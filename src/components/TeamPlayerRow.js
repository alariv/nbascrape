import React, { useEffect, useState } from "react";
import { TableRow, TableCell } from "@mui/material";
import SelectionList from "./SelectionList";
import DefaultFilters from "./DefaultFilters";
import Input from "./Input";
import teams from "../scrapedData/teams.json";
import SelectionListMultiple from "./SelectionListMultiple";
import leaguesData from "../scrapedData/leaguesData.json";
import { Button } from "@mui/material";
import Save from "@mui/icons-material/Save";

export default function TeamPlayerRow({
  team = "",
  player = "",
  players = [],
  index,
  filtersOnly = false,
  onSeasonChange = () => {},
  onMatchUpValueSeasonChange = () => {},
  onOpponentSelect = () => {},
  onMarketSelect = () => {},
  onExtraMarketSelect = () => {},
  onPredMinutesChange = () => {},
  defaultSeason = [],
  opponent = "",
  selectedMarket = "",
  selectedExtraMarket = "",
  defaultPredMinutes = "",
  seasonsLoading = false,
  playerSeasons,
  teamPlayersData = {},
}) {
  const [market, setMarket] = useState("");
  const [extraMarket, setExtraMarket] = useState("");
  const [line, setLine] = useState("");
  const [season, setSeason] = useState([]);
  const [predMinutes, setPredMinutes] = useState("");
  const [extraLine, setExtraLine] = useState("");
  const [selectedWplayer, setWplayer] = useState("");
  const [wPlayers, setWplayers] = useState(makeWplayersList());
  const [calculatedMatchUpValue, setCalculatedMatchUpValue] = useState("-");
  const [matchUpValue, setMatchUpValue] = useState("");
  const [predMinutesFilter, setPredMinutesFilter] = useState({
    filter: "+-",
    filterValue: "10",
  });
  const [extraLineFilter, setExtraLineFilter] = useState({
    filter: "over",
    filterValue: "10",
  });
  const [totalGames, setTotalGames] = useState(0);
  const [totalOver, setTotalOver] = useState(0);
  const [totalUnder, setTotalUnder] = useState(0);
  const [totalOverP, setTotalOverP] = useState("0");
  const [totalUnderP, setTotalUnderP] = useState("0");
  const [bookieOdds, setBookieOdds] = useState({ under: 0, over: 0 });
  const [unitSize, setUnitSize] = useState({ under: 0, over: 0 });

  function makeWplayersList() {
    let list = [];
    players.forEach((thisPlayer) => {
      if (player !== thisPlayer) {
        list.push("+ " + thisPlayer);
        list.push("- " + thisPlayer);
      }
    });
    return list;
  }

  useEffect(() => {
    if (team) {
      setWplayer("");
      setWplayers(makeWplayersList());
    }
  }, [team]);

  useEffect(() => {
    if (Object.keys(teamPlayersData).length) {
      console.log("teamPlayersData.length");
      console.log(Object.keys(teamPlayersData).length);

      const totalGames = findTotalGames(teamPlayersData);
      setTotalGames(Object.keys(teamPlayersData).length ? totalGames.total : 0);
      setTotalOver(Object.keys(teamPlayersData).length ? totalGames.over : 0);
      setTotalUnder(Object.keys(teamPlayersData).length ? totalGames.under : 0);
      console.log("FOUNT TOTAL GAMES", totalGames.total);

      let justcalculatedMatchupValue;
      if (
        opponent &&
        leaguesData[2022][opponent][
          leagueStatsMap[market ? market : selectedMarket]
        ] &&
        leaguesData[2022]["League Average"][
          leagueStatsMap[market ? market : selectedMarket]
        ]
      ) {
        console.log("setting new calculatedMatchupValue");
        setCalculatedMatchUpValue(
          (
            parseInt(
              leaguesData[2022][opponent][
                leagueStatsMap[market ? market : selectedMarket]
              ]
            ) /
              parseInt(
                leaguesData[2022]["League Average"][
                  leagueStatsMap[market ? market : selectedMarket]
                ]
              ) -
            1
          )
            .toFixed(5)
            .toString()
        );
        justcalculatedMatchupValue = (
          parseInt(
            leaguesData[2022][opponent][
              leagueStatsMap[market ? market : selectedMarket]
            ]
          ) /
            parseInt(
              leaguesData[2022]["League Average"][
                leagueStatsMap[market ? market : selectedMarket]
              ]
            ) -
          1
        ).toFixed(5);
      } else {
        // console.log("setting calculatedMatchupValue to -");

        setCalculatedMatchUpValue("-");
        justcalculatedMatchupValue = 0;
      }

      console.log(
        matchUpValue ? parseFloat(matchUpValue) : justcalculatedMatchupValue
      );

      const matchupValueToUse = matchUpValue
        ? parseFloat(matchUpValue)
        : justcalculatedMatchupValue;
      //RAW OVER = (OVerite arv/Total Games)*100
      //True Over = (OVerite arv / Total Games) * 100 + Matchup %
      //Matchup % = (Raw under*Matchup value)*Raw Over/100

      //RAW OVER = (OVerite arv / Total Games) * 100
      //EHK        (totalGames.over / totalGames.total) * 100

      //RAW UNDER = (Underite arv / Total Games) * 100=
      //EHK        (totalGames.under / totalGames.total) * 100

      //True Over = (OVerite arv / Total Games) * 100 + Matchup %
      //EHK         ((totalGames.over / totalGames.total) * 100) + ((totalGames.under / totalGames.total) * 100 * Number(matchupValueToUse)) * ((totalGames.over / totalGames.total) * 100) / 100

      //True Under = (Underite arv / Total Games) * 100 + Matchup %
      //EHK         ((totalGames.under / totalGames.total) * 100) + ((totalGames.under / totalGames.total) * 100 * Number(matchupValueToUse)) * ((totalGames.over / totalGames.total) * 100) / 100

      //Matchup % = (Raw under*Matchup value)*Raw Over/100
      //EHK         ((totalGames.under / totalGames.total) * 100 * Number(matchupValueToUse)) * ((totalGames.over / totalGames.total) * 100) / 100

      const overP = (
        totalGames.over > 0
          ? (totalGames.over / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
      ).toFixed(4);

      const underP = (
        totalGames.under > 0
          ? (totalGames.under / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
      ).toFixed(4);

      setTotalOverP(
        (totalGames.over > 0
          ? (totalGames.over / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
        ).toFixed(4)
      );
      setTotalUnderP(
        (totalGames.under > 0
          ? (totalGames.under / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
        ).toFixed(4)
      );
      setTimeout(() => {
        calculateUnitSize(
          totalGames.total,
          totalGames.over,
          totalGames.under,
          underP,
          overP
        );
      }, 500);
    }
  }, [
    teamPlayersData,
    season,
    line,
    predMinutesFilter,
    predMinutes,
    extraLineFilter,
    extraLine,
    extraMarket,
    selectedWplayer,
    market,
    selectedMarket,
    bookieOdds,
  ]);

  const findTotalGames = (list) => {
    const marketToSearch = market ? market : selectedMarket;
    const extraMarketToSearch = extraMarket ? extraMarket : selectedExtraMarket;
    const marketMapping = {
      "3P": "fg3",
      TRB: "trb",
      AST: "ast",
      STL: "stl",
      BLK: "blk",
      TOV: "tov",
      PTS: "pts",
      FGA: "fga",
      "3PA": "3pa",
    };
    console.log("finding total for", player);
    console.log(
      "searching from",
      JSON.stringify(season.length ? season : defaultSeason),
      (season.length ? season : defaultSeason).length
    );
    let playerMatchingSeasons;
    let games = [];
    let overGames = [];
    let underGames = [];
    if (player) {
      // console.log("LIST:", JSON.stringify(list));
      //filtering season
      playerMatchingSeasons = Object.keys(list.players).includes(player)
        ? Object.keys(list.players[player].playerData).filter((currentSeason) =>
            (season.length ? season : defaultSeason).includes(currentSeason)
          )
        : console.log("could not find player", player);

      (playerMatchingSeasons || []).forEach((matchedSeason) => {
        (list.players[player]?.playerData[matchedSeason]?.data
          ? Object.keys(list.players[player]?.playerData[matchedSeason]?.data)
          : []
        ).forEach((game) => {
          games.push(
            list.players[player]?.playerData[matchedSeason]?.data[game]
          );
        });
      });

      console.log("starting to filter from games:", games.length);

      //filtering market + line
      // games = games.filter((game) => {
      //   return parseInt(game[marketMapping[marketToSearch]]) > parseInt(line);
      // });

      //filtering predictedMinutes

      console.log(predMinutesFilter);
      console.log(predMinutes);

      games = games.filter((game) => {
        const minValue =
          predMinutesFilter.filter == "+-"
            ? parseInt(predMinutes) - parseInt(predMinutesFilter.filterValue)
            : predMinutesFilter.filter == "over"
            ? parseInt(predMinutes)
            : 0;

        const maxValue =
          predMinutesFilter.filter == "+-"
            ? parseInt(predMinutes) + parseInt(predMinutesFilter.filterValue)
            : predMinutesFilter.filter == "over"
            ? 999
            : parseInt(predMinutes) - 1;

        console.log("minutes minVal:", minValue);
        console.log("minutes maxVal:", maxValue);
        const minutesPlayed = game["mp"].split(":")[0];
        console.log("minutesPlayed in match:", minutesPlayed);
        return (
          parseFloat(minutesPlayed) >= minValue &&
          parseFloat(minutesPlayed) <= maxValue
        );
      });

      //filtering extraMarket + extraLine
      if (
        extraLineFilter.filter &&
        extraLineFilter.filterValue &&
        extraMarket
      ) {
        games = games.filter((game) => {
          return extraLineFilter.filter == "over"
            ? parseInt(game[marketMapping[extraMarketToSearch]]) >
                parseFloat(extraLineFilter.filterValue)
            : parseInt(game[marketMapping[extraMarketToSearch]]) <
                parseFloat(extraLineFilter.filterValue);
        });
      }

      console.log(games);

      //filtering with/witouh player

      console.log("comparing extraMarket to game value");
      console.log("----------");
      console.log(selectedWplayer);
      console.log("----------");

      let wwoPlayerName = selectedWplayer.substring(2, selectedWplayer.length);
      let wwoPlayerPrefix = selectedWplayer.substring(0, 1);

      let currentSeason = "2021-22";

      let wwoPlayerGameDates = [];
      let matchingGameDates = [];
      if (wwoPlayerName.length && wwoPlayerPrefix.length) {
        Object.keys(list.players).forEach((thisPlayer, index) => {
          if (thisPlayer == wwoPlayerName) {
            console.log("FOUND wwoPlayer MATCH @", index);

            Object.keys(
              list.players[wwoPlayerName].playerData[currentSeason].data
            ).forEach((wwoPlayerGame) => {
              wwoPlayerGameDates.push(
                list.players[wwoPlayerName].playerData[currentSeason].data[
                  wwoPlayerGame
                ].date
              );
            });

            Object.keys(
              list.players[player].playerData[currentSeason].data
            ).forEach((currentPlayerGame) => {
              wwoPlayerGameDates.includes(
                list.players[player].playerData[currentSeason].data[
                  currentPlayerGame
                ].date
              )
                ? wwoPlayerPrefix == "+" &&
                  matchingGameDates.push(
                    list.players[player].playerData[currentSeason].data[
                      currentPlayerGame
                    ].date
                  )
                : wwoPlayerPrefix == "-" &&
                  matchingGameDates.push(
                    list.players[player].playerData[currentSeason].data[
                      currentPlayerGame
                    ].date
                  );
            });
          }
        });
        console.log(matchingGameDates);

        games = games.filter((game) => matchingGameDates.includes(game.date));
      }
      console.log(games);

      overGames = games.filter((game) => {
        return (
          parseFloat(game[marketMapping[marketToSearch]]) >= parseFloat(line)
        );
      });
      underGames = games.filter((game) => {
        return (
          parseFloat(game[marketMapping[marketToSearch]]) < parseFloat(line)
        );
      });
    }

    console.log("finishing", Object.keys(games).length);
    return {
      total: games.length,
      over: overGames.length,
      under: underGames.length,
    };
  };

  const calculateUnitSize = (total, over, under, underP, overP) => {
    const predMinutesToSend =
      predMinutesFilter.filter == "+-"
        ? predMinutesFilter.filter +
          ":" +
          predMinutesFilter.filterValue +
          ":" +
          (predMinutes ? predMinutes : defaultPredMinutes)
        : predMinutesFilter.filter +
          ":" +
          (predMinutes ? predMinutes : defaultPredMinutes);

    console.log("calculating unit size:");
    // console.log('totalGames', totalGames);
    // const totalGames = findTotalGames(teamPlayersData);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market: market ? market : selectedMarket,
        season: season.length ? season : defaultSeason,
        extraMarket: extraMarket ? extraMarket : selectedExtraMarket,
        line: line,
        predMinutes: predMinutesToSend,
        selectedWplayer: selectedWplayer,
        totalGames: total,
        totalOver: over,
        totalUnder: under,
        totalOverP: overP,
        totalUnderP: underP,
        bookieOdds: bookieOdds,
        player: player,
      }),
    };
    fetch("http://localhost:3001/calculateunitsize", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log("new data from calculateUnitSize");
        setUnitSize({
          under: data.unitSizeUnder,
          over: data.unitSizeOver,
        });
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const savePlayer = () => {
    const marketToSave = market ? market : selectedMarket;
    const seasonToSave = season.length ? season : defaultSeason;
    const extraMarketToSave = extraMarket ? extraMarket : selectedExtraMarket;
    const predMinutesToSave =
      predMinutesFilter.filter == "+-"
        ? predMinutesFilter.filter +
          ":" +
          predMinutesFilter.filterValue +
          ":" +
          (predMinutes ? predMinutes : defaultPredMinutes)
        : predMinutesFilter.filter +
          ":" +
          (predMinutes ? predMinutes : defaultPredMinutes);

    console.log("saving player", player);
    console.log("marketToSave", marketToSave);
    console.log("line", line);
    console.log("seasonToSave", seasonToSave);
    console.log("predMinutes", predMinutesToSave);
    console.log("extraMarketToSave", extraMarketToSave);
    console.log("selectedWplayer", selectedWplayer);

    const saveObj = {
      playerName: player,
      market: marketToSave,
      line: line,
      season: seasonToSave,
      predMinutes: predMinutesToSave,
      extraMarket: extraMarketToSave,
      selectedWplayer: selectedWplayer,
    };

    const savedPlayerRows = JSON.parse(localStorage.getItem("spr")) || {};
    console.log(savedPlayerRows);

    const modifiedPlayerRows = savedPlayerRows
      ? {
          ...savedPlayerRows,
          [player]: { ...savedPlayerRows[player], [marketToSave]: saveObj },
        }
      : { [player]: { [marketToSave]: saveObj } };

    localStorage.setItem("spr", JSON.stringify(modifiedPlayerRows));
  };

  useEffect(() => {
    let depthData =
      JSON.parse(window.localStorage.getItem("depthData")) || null;
    !!depthData &&
      Object.keys(depthData[team]).forEach((pos) => {
        // console.log(pos);
        Object.keys(depthData[team][pos]).forEach((positionClass) => {
          if (depthData[team][pos][positionClass].player == player) {
            setPredMinutes(depthData[team][pos][positionClass].value);
          }
        });
      });
  }, []);

  useEffect(() => {
    if (
      opponent &&
      leaguesData[2022][opponent][
        leagueStatsMap[market ? market : selectedMarket]
      ] &&
      leaguesData[2022]["League Average"][
        leagueStatsMap[market ? market : selectedMarket]
      ]
    ) {
      console.log("setting new calculatedMatchupValue");
      setCalculatedMatchUpValue(
        (
          parseInt(
            leaguesData[2022][opponent][
              leagueStatsMap[market ? market : selectedMarket]
            ]
          ) /
            parseInt(
              leaguesData[2022]["League Average"][
                leagueStatsMap[market ? market : selectedMarket]
              ]
            ) -
          1
        )
          .toFixed(5)
          .toString()
      );
    } else {
      // console.log("setting calculatedMatchupValue to -");
      // console.log(!!opponent);
      // console.log(
      //   !!leaguesData[2022][opponent][
      //     leagueStatsMap[market ? market : selectedMarket]
      //   ]
      // );
      // console.log(
      //   !!leaguesData[2022]['League Average'][
      //     leagueStatsMap[market ? market : selectedMarket]
      //   ]
      // );
      setCalculatedMatchUpValue("-");
    }
  }, [selectedMarket, market, opponent]);

  const markets = {
    "3P": "3P",
    TRB: "TRB",
    AST: "AST",
    STL: "STL",
    BLK: "BLK",
    TOV: "TOV",
    PTS: "PTS",
  };

  const extraMarkets = {
    FGA: "FGA",
    "3PA": "3PA",
  };

  const leagueStatsMap = {
    "3P": "3P",
    TRB: "trb",
    AST: "ast",
    STL: "stl",
    BLK: "blk",
    TOV: "tov",
    PTS: "pts",
    FGA: "fg2",
    "3PA": "3PA",
  };

  // useEffect(() => {
  //   console.log('defSeason in teamPlayer sent to row:', defaultSeason)
  //   console.log(players)
  // }, [defaultSeason])

  const seasons = [
    "2016-17",
    "2017-18",
    "2018-19",
    "2019-20",
    "2020-21",
    "2021-22",
  ];

  //   const handleOpponentSelect = team => {
  //     setOpponent(team)
  //   }

  const handleMarketSelect = (market) => {
    setMarket(market);
    const savedPlayerRows = JSON.parse(localStorage.getItem("spr")) || {};

    // console.log(savedPlayerRows[player][market]);

    if (savedPlayerRows[player] && savedPlayerRows[player][market]) {
      //////////SIIN
      setExtraMarket(savedPlayerRows[player][market].extraMarket);
      setSeason(
        typeof savedPlayerRows[player][market].season === "string"
          ? savedPlayerRows[player][market].season.split(",")
          : savedPlayerRows[player][market].season
      );
      setLine(savedPlayerRows[player][market].line);
      setPredMinutes(savedPlayerRows[player][market].predMinutes.split(":")[2]);
      setPredMinutesFilter({
        filter: savedPlayerRows[player][market].predMinutes.split(":")[0],
        filterValue: savedPlayerRows[player][market].predMinutes.split(":")[1],
      });
      setWplayer(savedPlayerRows[player][market].selectedWplayer);
    }
  };
  const handleExtraMarketSelect = (extraMarket) => {
    setExtraMarket(extraMarket);
  };

  const handleSeasonSelect = (season) => {
    setSeason(typeof season === "string" ? season.split(",") : season);
  };

  const handleLineChange = (line) => {
    setLine(line);
  };
  const handleMatchUpValueChange = (value) => {
    value = !value ? " " : value.trim();
    setMatchUpValue(value);
  };

  const handlePredMinutesChange = (predMinutes) => {
    setPredMinutes(predMinutes.value);
    setPredMinutesFilter({
      filter: predMinutes.filter,
      filterValue: predMinutes.filterValue,
    });
  };

  const handleExtraLineChange = (line) => {
    setExtraLine(line.value);
    setExtraLineFilter({
      filter: line.filter,
      filterValue: line.value,
    });
  };

  const handleWPlayerChange = (wPlayer) => {
    setWplayer(wPlayer);
  };

  const handleBookieOddsChange = (odds, direction) => {
    console.log("odds change", odds, direction);
    setBookieOdds({ ...bookieOdds, [direction]: odds });
  };

  return (
    <>
      {filtersOnly ? (
        <DefaultFilters
          seasons={seasons.reverse()}
          onSeasonChange={onSeasonChange}
          onTeamChange={onOpponentSelect}
          onMarketChange={onMarketSelect}
          onExtraMarketChange={onExtraMarketSelect}
          onPredMinutesChange={onPredMinutesChange}
          markets={Object.values(markets)}
          extraMarkets={Object.values(extraMarkets)}
          currentTeam={team}
          seasonsLoading={seasonsLoading}
          onMatchUpValueSeasonChange={onMatchUpValueSeasonChange}
        />
      ) : (
        <TableRow
          key={index}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          {/* SAVE ROW */}
          <TableCell component="th" scope="row" className={"player"}>
            <div style={{ display: "flex" }}>
              <Button
                onClick={() => {
                  savePlayer();
                }}
                style={{}}
              >
                <Save color="action" />
              </Button>
              {player}
            </div>
          </TableCell>
          {/* OPPONENT */}
          <TableCell className={"opponent"}>
            <SelectionList
              value={opponent}
              list={Object.keys(teams)}
              dense
              disabled
            />
          </TableCell>
          {/* MARKET */}
          <TableCell className={"market"}>
            <SelectionList
              value={market ? market : selectedMarket}
              onChange={handleMarketSelect}
              list={Object.values(markets)}
              dense
            />
          </TableCell>
          {/* LINE */}
          <TableCell className={"line"}>
            <Input value={line} onChange={handleLineChange} dense narrow />
          </TableCell>
          {/* SEASON */}
          <TableCell className={"seasons"}>
            <SelectionListMultiple
              value={season.length ? season : defaultSeason}
              onChange={handleSeasonSelect}
              list={playerSeasons.reverse()}
              disabled={seasonsLoading}
              dense
            />
          </TableCell>
          {/* PRED MINUTED RANGE */}
          <TableCell className={"predMinutes"}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <SelectionList
                value={predMinutesFilter.filter}
                onChange={(value) => {
                  handlePredMinutesChange({
                    value: predMinutes ? predMinutes : defaultPredMinutes,
                    filter: value,
                    filterValue: predMinutesFilter.filterValue,
                  });
                }}
                list={["+-", "over", "under"]}
                dense
              />
              {predMinutesFilter.filter == "+-" ? (
                <Input
                  value={predMinutesFilter.filterValue}
                  onChange={(value) => {
                    handlePredMinutesChange({
                      value: predMinutes ? predMinutes : defaultPredMinutes,
                      filter: predMinutesFilter.filter,
                      filterValue: value,
                    });
                  }}
                  dense
                />
              ) : (
                <Input
                  value={predMinutes ? predMinutes : defaultPredMinutes}
                  onChange={(value) => {
                    handlePredMinutesChange({
                      value: value,
                      filter: predMinutesFilter.filter,
                      filterValue: predMinutesFilter.filterValue,
                    });
                  }}
                  dense
                />
              )}
            </div>
            {predMinutesFilter.filter == "+-" && (
              <Input
                value={predMinutes ? predMinutes : defaultPredMinutes}
                onChange={(value) => {
                  handlePredMinutesChange({
                    value: value,
                    filter: predMinutesFilter.filter,
                    filterValue: predMinutesFilter.filterValue,
                  });
                }}
                dense
              />
            )}
          </TableCell>
          {/* EXTRA FILTRID */}
          <TableCell className={"extraFilter"}>
            <SelectionList
              value={extraMarket ? extraMarket : selectedExtraMarket}
              onChange={handleExtraMarketSelect}
              list={[""].concat(Object.values(extraMarkets))}
              dense
            />
          </TableCell>
          {/* EXTRA FILTRI LIIN */}
          <TableCell className={"extraFilterLine"}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <SelectionList
                value={extraLineFilter.filter}
                onChange={(value) => {
                  handleExtraLineChange({
                    value: extraLine,
                    filter: value,
                    filterValue: extraLineFilter.filterValue,
                  });
                }}
                list={["over", "under"]}
                dense
              />

              <Input
                value={extraLine}
                onChange={(value) => {
                  handleExtraLineChange({
                    value: value,
                    filter: extraLineFilter.filter,
                    filterValue: extraLineFilter.filterValue,
                  });
                }}
                dense
              />
            </div>
          </TableCell>
          {/* +- PLAYER */}
          <TableCell className={"wwoplayer"}>
            <SelectionList
              value={selectedWplayer}
              onChange={handleWPlayerChange}
              list={[""].concat(wPlayers)}
              dense
            />
          </TableCell>
          {/* TOTAL GAMES (OVER/UNDER) */}
          <TableCell className={"totalGames"}>
            <Input
              value={`${totalGames} (${totalOver}/${totalUnder})`}
              onChange={() => {}}
              dense
              disabled
            />
          </TableCell>
          {/* MATCHUP VALUE */}
          <TableCell className={"matchupValue"}>
            <Input
              value={matchUpValue ? matchUpValue : calculatedMatchUpValue}
              onChange={handleMatchUpValueChange}
              onBlur={() => {
                setMatchUpValue(matchUpValue.trim());
              }}
              dense
              wide
            />
          </TableCell>
          {/* TRUE OVER % */}
          <TableCell className={"trueOver"}>
            <Input
              value={totalOverP.toString()}
              onChange={() => {}}
              dense
              wide
              disabled
            />
            <Input
              value={totalUnderP.toString()}
              onChange={() => {}}
              dense
              wide
              disabled
            />
          </TableCell>

          {/* BOOKIE ODDS */}
          <TableCell className={"bookieOdds"}>
            <Input
              value={bookieOdds.over.toString()}
              onChange={(v) => {
                handleBookieOddsChange(v, "over");
              }}
              dense
              narrow
            />
            <Input
              value={bookieOdds.under.toString()}
              onChange={(v) => {
                handleBookieOddsChange(v, "under");
              }}
              dense
              narrow
            />
          </TableCell>
          {/* UNIT SIZE */}
          <TableCell className={"unitSize"}>
            <Input
              value={unitSize.over ? unitSize.over.toString() : "Viga"}
              onChange={() => {}}
              dense
              disabled
            />
            <Input
              value={unitSize.under ? unitSize.under.toString() : "Viga"}
              onChange={() => {}}
              dense
              wide
              disabled
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
