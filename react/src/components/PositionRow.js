import React, { useEffect, useState } from "react";
import { TableRow, TableCell } from "@mui/material";
import SelectionList from "./SelectionList";
import Input from "./Input";

export default function PositionRow({ position, players, team }) {
  const [values, setValues] = useState({
    a: { value: "", player: "" },
    b: { value: "", player: "" },
    c: { value: "", player: "" },
  });
  const [loading, setLoading] = useState(true);
  const [teamDepthDataFromLS, setTeamDepthDataFromLS] = useState({});

  useEffect(() => {
    setTeamDepthDataFromLS(
      JSON.parse(window.localStorage.getItem("depthData"))
    );
  }, [team]);

  useEffect(() => {
    if (
      teamDepthDataFromLS &&
      Object.keys(teamDepthDataFromLS).length &&
      team
    ) {
      setValues(
        teamDepthDataFromLS[team]
          ? teamDepthDataFromLS[team][position]
          : {
              a: { value: "", player: "" },
              b: { value: "", player: "" },
              c: { value: "", player: "" },
            }
      );
      setLoading(false);
    }
  }, [teamDepthDataFromLS]);

  const handlePositionChange = (playerClass, playerName) => {
    let tempValues = values;
    const playerToReplace = tempValues[playerClass].player;
    tempValues[playerClass].player = playerName;

    if (playerToReplace) {
      const classToReplace = Object.keys(tempValues).filter(
        (tempPlayerClass) =>
          tempValues[tempPlayerClass].player == playerName &&
          tempPlayerClass !== playerClass
      )[0];
      if (classToReplace) {
        tempValues[classToReplace].player = playerToReplace;
      }
    }

    setValues({ ...tempValues });
  };

  const handleTimeChange = (playerClass, time) => {
    let tempValues = values;
    tempValues[playerClass].value = time;
    setValues({ ...tempValues });
  };

  useEffect(() => {
    const depthDataFromLS =
      JSON.parse(window.localStorage.getItem("depthData")) || {};
    let dataToSave = { ...depthDataFromLS };
    dataToSave[team] = !dataToSave[team] ? {} : dataToSave[team];
    dataToSave[team][position] = values;
    window.localStorage.setItem("depthData", JSON.stringify(dataToSave));
  }, [values]);

  return (
    <>
      {!loading && Object.keys(teamDepthDataFromLS).length && (
        <TableRow
          key={position}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell>{position}</TableCell>
          <TableCell>
            <SelectionList
              value={(values && values["a"]?.player) || ""}
              list={players}
              onChange={(player) => {
                handlePositionChange("a", player);
              }}
              dense
            />
          </TableCell>
          <TableCell>
            <SelectionList
              value={(values && values["b"]?.player) || ""}
              list={players}
              onChange={(player) => {
                handlePositionChange("b", player);
              }}
              dense
            />
          </TableCell>
          <TableCell>
            <SelectionList
              value={(values && values["c"]?.player) || ""}
              list={players}
              onChange={(player) => {
                handlePositionChange("c", player);
              }}
              dense
            />
          </TableCell>
          <TableCell>
            <Input
              value={(values && values["a"]?.value) || ""}
              onChange={(time) => {
                handleTimeChange("a", time);
              }}
              dense
              narrow
            />
          </TableCell>
          <TableCell>
            <Input
              value={(values && values["b"]?.value) || ""}
              onChange={(time) => {
                handleTimeChange("b", time);
              }}
              dense
              narrow
            />
          </TableCell>
          <TableCell>
            <Input
              value={(values && values["c"]?.value) || ""}
              onChange={(time) => {
                handleTimeChange("c", time);
              }}
              dense
              narrow
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
