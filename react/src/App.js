import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import { AppBar } from "@mui/material";
import { Toolbar } from "@mui/material";
import { Button } from "@mui/material";
import Teams from "./views/TeamsView";
import DepthCharts from "./views/DepthChartsView";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Sync from "@mui/icons-material/Sync";

function App() {
  const navigate = useNavigate();
  const [dataLoading, setDataLoading] = useState(false);

  const updateData = () => {
    setDataLoading(true);
    //updatePlayersStats/:team
    fetch("http://localhost:3001/updateTeamsData")
      .then((response) => response.json())
      .then((data) => {
        console.log("new data fetched");
        window.localStorage.setItem(
          "teamsDataUpdated",
          new Date().getTime().toString()
        );
      })
      .finally(() => {
        setDataLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const lastUpdate = parseInt(
      window.localStorage.getItem("teamsDataUpdated")
    );
    if ((new Date().getTime() - lastUpdate) / 1000 / 60 / 60 > 3) {
      console.log(
        "FETCHING DATA. Time from last update:",
        ((new Date().getTime() - lastUpdate) / 1000 / 60 / 60).toFixed(2),
        "hours"
      );
      updateData();
    } else {
      console.log(
        "Time from last fetch:",
        ((new Date().getTime() - lastUpdate) / 1000 / 60 / 60).toFixed(2),
        "hours"
      );
    }
  }, []);

  return (
    <div className="App">
      <AppBar
        position={"absolute"}
        color="transparent"
        sx={{
          alignItems: "center",
          backdropFilter: "blur(10px) brightness(70%)",
        }}
      >
        <Toolbar>
          <Button
            variant="text"
            color="info"
            size="large"
            sx={{ fontWeight: 600, margin: "0 20px" }}
            onClick={() => {
              navigate("/");
            }}
          >
            Teams
          </Button>
          <Button
            variant="text"
            color="error"
            size="large"
            sx={{ fontWeight: 600, margin: "0 20px" }}
            onClick={() => {
              navigate("/depth");
            }}
          >
            Depth charts
          </Button>
          <Button
            onClick={() => {
              updateData();
            }}
            style={{ position: "fixed", right: "10px" }}
          >
            <Sync color="action" />
          </Button>
        </Toolbar>
        {dataLoading && (
          <Stack sx={{ color: "grey.500", width: "100%" }}>
            <LinearProgress color="success" />
          </Stack>
        )}
      </AppBar>

      <Routes>
        <Route
          path="/"
          element={
            <Teams
              setOverallLoading={(v) => {
                setDataLoading(v);
              }}
            />
          }
        />
        <Route path="/depth" element={<DepthCharts />} />
        {/* <Route path="/matchup" element={<MatchUps />} /> */}
      </Routes>
    </div>
  );
}

export default App;
