import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import PositionRow from "components/PositionRow";
import React, { useEffect, useState } from "react";
import teamsString from "../scrapedData/teams.json";

export default function DepthCharts() {
  const [loading, setLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedTeam, setTeam] = useState("");
  const [teams, setTeams] = useState({});
  const [teamPlayers, setTeamPlayers] = useState({});
  const [sortedPlayers, setSortedPlayers] = useState({});
  const tableHeadingStyle = { fontWeight: "600" };
  const tableColumns = ["", "A", "B", "C", "A", "B", "C"];

  useEffect(() => {
    window.localStorage.getItem("selectedTeam") &&
      setTeam(window.localStorage.getItem("selectedTeam"));
  }, []);

  useEffect(() => {
    Object.keys(teams).length && selectedTeam && handleTeamSelect(selectedTeam);
  }, [selectedTeam, teams]);

  useEffect(() => {
    setTeams(teamsString);
  }, [teamsString]);

  const handleTeamSelect = (team) => {
    setTeam(team);
    setPlayersLoading(true);
    let teamPlayersArr = [];
    let sortedPlayersList = {};
    Object.keys(teams[team].players).map((player) => {
      teamPlayersArr[player] = teams[team].players[player];
      sortedPlayersList[teams[team].players[player].pos] = !sortedPlayersList[
        teams[team].players[player].pos
      ]
        ? []
        : sortedPlayersList[teams[team].players[player].pos];

      sortedPlayersList[teams[team].players[player].pos].push(player);
    });
    setTeamPlayers(teamPlayersArr);
    setSortedPlayers(sortedPlayersList);
    window.localStorage.setItem("selectedTeam", team);
    setPlayersLoading(false);
  };

  return (
    <>
      <header className="App-header">
        <h3>DepthCharts</h3>
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
                handleTeamSelect(e.target.value);
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

      {selectedTeam && sortedPlayers && !loading && (
        <>
          <Grid container spacing={2} className="statsTable depth">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {tableColumns.map((colHeading, idx) => (
                      <TableCell sx={tableHeadingStyle} key={idx}>
                        {colHeading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(sortedPlayers).map((position, idx) => (
                    <PositionRow
                      position={position}
                      players={Object.keys(teamPlayers)}
                      team={selectedTeam}
                      key={idx}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </>
      )}
    </>
  );
}
