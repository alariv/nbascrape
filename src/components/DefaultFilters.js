import React, { useEffect, useState } from "react";
import { TableRow, TableCell } from "@mui/material";
import SelectionList from "./SelectionList";
import teams from "../scrapedData/teams.json";
import SelectionListMultiple from "./SelectionListMultiple";
import Input from "./Input";

export default function TeamPlayerRow({
  seasons,
  markets,
  extraMarkets,
  onSeasonChange,
  onMatchUpValueSeasonChange,
  onTeamChange,
  onMarketChange,
  onExtraMarketChange,
  onPredMinutesChange,
  currentTeam,
  seasonsLoading = false,
}) {
  const [opponent, setOpponent] = useState("");
  const [market, setMarket] = useState("");
  const [extraMarket, setExtraMarket] = useState("");
  const [season, setSeason] = useState(["2021-22"]);
  const [matchUpValueSeason, setMatchUpValueSeason] = useState(["2021-22"]);
  const [predMinutes, setPredMinutes] = useState("");
  const [team, setTeam] = useState("");
  const [opponents, setOpponents] = useState([]);

  function makeOpponentsList() {
    let list = [];
    // console.log(currentTeam)
    Object.keys(teams).forEach((thisTeam) => {
      if (currentTeam !== thisTeam) {
        list.push(thisTeam);
      }
    });
    // console.log('made list')
    // console.log(list)
    setOpponents(list);
  }

  useEffect(() => {
    makeOpponentsList();
  }, []);

  useEffect(() => {
    makeOpponentsList();
  }, [currentTeam]);

  const handleOpponentSelect = (team) => {
    setOpponent(team);
  };

  const handleMarketSelect = (market) => {
    setMarket(market);
    onMarketChange(market);
  };

  const handleExtraMarketSelect = (market) => {
    setExtraMarket(market);
    onExtraMarketChange(market);
  };

  const handleSeasonSelect = (season) => {
    // console.log('seaon in deffilters:', season)
    setSeason(season);
    onSeasonChange(season);
  };

  const handleMatchUpValueSeasonSelect = (season) => {
    // console.log('seaon in deffilters:', season)
    setMatchUpValueSeason(season);
    onMatchUpValueSeasonChange(season);
  };

  const handlePredMinutesChange = (predMinutes) => {
    // console.log('pred minutes in deffilters:', predMinutes)
    setPredMinutes(predMinutes);
    onPredMinutesChange(predMinutes);
  };

  const handleTeamSelect = (team) => {
    setTeam(team);
    onTeamChange(team);
  };

  return (
    <TableRow
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        backgroundColor: "#dfe9e5",
      }}
    >
      <TableCell component="th" scope="row"></TableCell>
      <TableCell>
        <SelectionList
          value={team}
          onChange={handleTeamSelect}
          list={opponents}
          dense
        />
      </TableCell>
      <TableCell>
        <SelectionList
          value={market}
          onChange={handleMarketSelect}
          list={markets}
          dense
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <SelectionListMultiple
          value={season}
          onChange={handleSeasonSelect}
          list={seasons}
          disabled={seasonsLoading}
          dense
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <SelectionList
          value={extraMarket}
          onChange={handleExtraMarketSelect}
          list={[""].concat(extraMarkets)}
          dense
        />{" "}
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        <SelectionListMultiple
          value={matchUpValueSeason}
          onChange={handleMatchUpValueSeasonSelect}
          list={[...seasons.slice(0, 2)]}
          disabled={seasonsLoading}
          dense
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
