import React, { useEffect, useState } from "react";
import { TableRow, TableCell, Button } from "@mui/material";
import SelectionList from "./SelectionList";
import teams from "../scrapedData/teams.json";
import SelectionListMultiple from "./SelectionListMultiple";
import Input from "./Input";

export default function DefaultFilters({
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
  onPredMinutesToggle,
}) {
  const [opponent, setOpponent] = useState("");
  const [market, setMarket] = useState("");
  const [extraMarket, setExtraMarket] = useState("");
  const [season, setSeason] = useState(["2021-22"]);
  const [matchUpValueSeason, setMatchUpValueSeason] = useState(["2021-22"]);
  const [predMinutes, setPredMinutes] = useState("");
  const [team, setTeam] = useState("");
  const [opponents, setOpponents] = useState([]);

  useEffect(() => {
    seasons && setSeason([seasons[0]]);
    seasons && setMatchUpValueSeason([seasons[0]]);
  }, []);

  function makeOpponentsList() {
    let list = [];
    Object.keys(teams).forEach((thisTeam) => {
      if (currentTeam !== thisTeam) {
        list.push(thisTeam);
      }
    });
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
    setSeason(season);
    onSeasonChange(season);
  };

  const handleMatchUpValueSeasonSelect = (season) => {
    setMatchUpValueSeason(season);
    onMatchUpValueSeasonChange(season);
  };

  const handlePredMinutesChange = (predMinutes) => {
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
        "&:last-child td, &:last-child th": {
          borderWidth: 0,
          borderBottomWidth: "2px",
          borderColor: "#34acff33",
        },
      }}
    >
      <TableCell style={{ top: 55 }} component="th" scope="row"></TableCell>
      <TableCell style={{ top: 55 }}>
        <SelectionList
          value={team}
          onChange={handleTeamSelect}
          list={opponents}
          dense
        />
      </TableCell>
      <TableCell style={{ top: 55 }}>
        <SelectionList
          value={market}
          onChange={handleMarketSelect}
          list={markets}
          dense
        />
      </TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}>
        <div style={{ display: "flex" }}>
          <Button
            size="small"
            variant="text"
            color="info"
            sx={{ fontWeight: 600, marginLeft: "5px" }}
            onClick={() => {
              onPredMinutesToggle("saved");
            }}
          >
            Saved
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            sx={{ fontWeight: 600 }}
            onClick={() => {
              onPredMinutesToggle("depth");
            }}
          >
            Depth
          </Button>
        </div>
      </TableCell>
      <TableCell style={{ top: 55 }}>
        <SelectionList
          value={extraMarket}
          onChange={handleExtraMarketSelect}
          list={[""].concat(extraMarkets)}
          dense
        />{" "}
      </TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}>
        <SelectionListMultiple
          value={matchUpValueSeason}
          onChange={handleMatchUpValueSeasonSelect}
          list={[...seasons.slice(0, 3)]}
          disabled={seasonsLoading}
          dense
        />
      </TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
      <TableCell style={{ top: 55 }}></TableCell>
    </TableRow>
  );
}
