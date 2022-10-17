import React, { useEffect, useState } from "react";
import {
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import TeamPlayerRow from "../components/TeamPlayerRow";
import teamsString from "../scrapedData/teams.json";
import Input from "components/Input";

export default function Teams({ setOverallLoading }) {
  const [loading, setLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedTeam, setTeam] = useState("");
  const [defaultSeason, setDefaultSeason] = useState([]);
  const [defaultMatchUpValueSeason, setDefaultMatchUpValueSeason] = useState(
    []
  );
  const tableHeadingStyle = { fontWeight: "600" };
  const [opponent, setOpponent] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedExtraMarket, setSelectedExtraMarket] = useState("");
  const [defaultPredMinutes, setdefaultPredMinutes] = useState("");
  const [seasonsLoading, setSeasonsLoading] = useState(false);

  const [teamPlayers, setTeamPlayers] = useState([]);
  const [teamPlayersData, setTeamPlayersData] = useState({});
  const [teams, setTeams] = useState({});
  const [predMinutesToggleState, setPredMinutesToggleState] = useState("depth");

  const currentDate = new Date();

  useEffect(() => {
    playersLoading || seasonsLoading || loading
      ? setOverallLoading(true)
      : setOverallLoading(false);
  }, [playersLoading, seasonsLoading, loading]);

  const tableColumns = [
    selectedTeam,
    "Opponent",
    "Market",
    "Line",
    "Seasons",
    "Pred. min range",
    "Extra\nfiltrid",
    "Line",
    "+/- player",
    "Total games (Over/Under)",
    "Matchup value",
    "True % (Over/Under)",
    "Bookie odds",
    "Unit size (Over/Under)",
  ];

  useEffect(() => {
    window.localStorage.getItem("selectedTeam") &&
      setTeam(window.localStorage.getItem("selectedTeam"));
  }, []);

  useEffect(() => {
    Object.keys(teams).length && selectedTeam && handleTeamSelect(selectedTeam);

    if (selectedTeam && teams) fetchPlayerSeasonsIfNeeded();
  }, [selectedTeam, teams]);

  const fetchPlayerSeasonsIfNeeded = () => {
    setSeasonsLoading(true);
    let teamSeasonsFetchTime =
      JSON.parse(window.localStorage.getItem("playersSeasonsFetched")) || {};
    if (!Object.keys(teamSeasonsFetchTime).length) teamSeasonsFetchTime = {};

    console.log("teamSeasonsFetchTime", teamSeasonsFetchTime);
    const timeDiffHours =
      (new Date().getTime() - teamSeasonsFetchTime[selectedTeam]) /
      1000 /
      60 /
      60;
    if (
      (selectedTeam && teamsString) ||
      !Object.keys(teamSeasonsFetchTime).length ||
      !teamSeasonsFetchTime[selectedTeam] ||
      (!isNaN(timeDiffHours) && timeDiffHours > 3)
    ) {
      console.log("ASKING TO UPDATE PLAYER STATS");
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teams),
      };
      fetch(
        `http://localhost:3001/updatePlayersStats/${selectedTeam}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Players seasons fetched");
          window.localStorage.setItem(
            "playersSeasonsFetched",
            JSON.stringify({
              ...teamSeasonsFetchTime,
              [selectedTeam]: new Date().getTime().toString(),
            })
          );
          setTeamPlayersData({
            [selectedTeam]: data[selectedTeam],
          });
        })
        .finally(() => {
          setSeasonsLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(!!teamsString, !!selectedTeam);
      console.log(Object.keys(teamSeasonsFetchTime).length);
      console.log();
      console.log(
        "teamSeasons already fetched",
        (new Date().getTime() - teamSeasonsFetchTime[selectedTeam]) /
          1000 /
          60 /
          60
      );
    }
  };

  useEffect(() => {
    setTeams(teamsString);
  }, [teamsString]);

  const handleTeamSelect = (team) => {
    setPlayersLoading(true);
    let teamPlayersArr = [];
    Object.keys(teams[team].players).map((player) => {
      teamPlayersArr.push(player);
    });
    setTeamPlayers(teamPlayersArr);
    window.localStorage.setItem("selectedTeam", team);
    setPlayersLoading(false);
    setTeam(team);
  };

  const handleOpponentSelect = (opponent) => {
    setOpponent(opponent);
  };

  const handleMarketSelect = (market) => {
    setSelectedMarket(market);
  };

  const handleExtraMarketSelect = (market) => {
    setSelectedExtraMarket(market);
  };

  const handleDefaultSeaonChange = (season) => {
    setDefaultSeason(typeof season === "string" ? season.split(",") : season);
  };
  const handleMatchUpValueSeasonChange = (season) => {
    setDefaultMatchUpValueSeason(
      typeof season === "string" ? season.split(",") : season
    );
  };

  const handlePredMinutesChange = (predMinutes) => {
    setdefaultPredMinutes(predMinutes);
  };

  const onPredMinutesToggle = (value) => {
    console.log("toggled????", value);
    setPredMinutesToggleState(value);
  };

  return (
    <>
      <header className="App-header">
        <h3>Teams</h3>
      </header>
      {!loading && (
        <div>
          <FormControl style={{ minWidth: "200px" }}>
            <InputLabel id="demo-simple-select-label">Select team</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedTeam}
              label="Select team"
              onChange={(e) => {
                setTeam(e.target.value);
              }}
            >
              {Object.keys(teams).map((team, idx) => (
                <MenuItem value={team} key={idx}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      {selectedTeam && !loading && (
        <>
          <TableContainer
            component={Paper}
            className="statsTable"
            sx={{ maxHeight: "100vh" }}
          >
            <Table
              sx={{ minWidth: 650 }}
              aria-label="simple table"
              stickyHeader
            >
              <TableHead>
                <TableRow
                  sx={{
                    "&:last-child td, &:last-child th": {
                      borderWidth: 0,
                      borderColor: "white",
                    },
                    justifyContent: "space-evenly",
                  }}
                >
                  {tableColumns.map((colHeading, idx) => (
                    <TableCell key={idx} sx={tableHeadingStyle}>
                      {colHeading}
                    </TableCell>
                  ))}
                </TableRow>
                <TeamPlayerRow
                  index={9999}
                  filtersOnly
                  onSeasonChange={handleDefaultSeaonChange}
                  onMatchUpValueSeasonChange={handleMatchUpValueSeasonChange}
                  onOpponentSelect={handleOpponentSelect}
                  onMarketSelect={handleMarketSelect}
                  onExtraMarketSelect={handleExtraMarketSelect}
                  onPredMinutesChange={handlePredMinutesChange}
                  opponent={opponent}
                  team={selectedTeam}
                  seasonsLoading={seasonsLoading}
                  playerSeasons={[]}
                  defaultMatchUpValueSeason={defaultMatchUpValueSeason}
                  onPredMinutesToggle={onPredMinutesToggle}
                />
              </TableHead>
              <TableBody>
                {teamPlayers.map((player, idx) => {
                  return (
                    <TeamPlayerRow
                      key={idx}
                      team={selectedTeam}
                      player={player}
                      players={teamPlayers}
                      index={idx}
                      defaultSeason={defaultSeason ?? []}
                      opponent={opponent}
                      selectedMarket={selectedMarket}
                      selectedExtraMarket={selectedExtraMarket}
                      defaultPredMinutes={defaultPredMinutes}
                      seasonsLoading={seasonsLoading}
                      playerSeasons={Object.keys(
                        teamPlayersData[selectedTeam]?.players[player]
                          ?.playerData || [
                          `${currentDate.getFullYear() - 1}-${currentDate
                            .getFullYear()
                            .toString()
                            .substr(2, 4)}`,
                        ]
                      ).reverse()}
                      teamPlayersData={teamPlayersData[selectedTeam]}
                      defaultMatchUpValueSeason={defaultMatchUpValueSeason}
                      predMinutesToggleState={predMinutesToggleState}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
}
