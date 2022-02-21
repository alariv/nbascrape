import logo from './logo.svg'
import React, {useEffect, useState} from 'react'
import {Routes, Route, useNavigate} from 'react-router-dom'
import './App.css'
import {AppBar} from '@mui/material'
import {Toolbar} from '@mui/material'
import {Button} from '@mui/material'
import Teams from './views/TeamsView'
import DeptCharts from './views/DeptChartsView'
import MatchUps from './views/MatchUpsView'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'

function App() {
  const navigate = useNavigate()
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/updateTeamsData')
      .then(response => response.json())
      .then(data => {
        console.log('fetched new data')
      })
      .finally(() => {
        setDataLoading(false)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])

  return (
    <div className="App">
      <AppBar color="transparent" sx={{alignItems: 'center', backdropFilter: 'blur(10px) brightness(70%)'}}>
        <Toolbar>
          <Button
            variant="text"
            sx={{fontWeight: 600, margin: '0 20px'}}
            onClick={() => {
              navigate('/')
            }}
          >
            Teams
          </Button>
          <Button
            variant="text"
            color="secondary"
            sx={{fontWeight: 600, margin: '0 20px'}}
            onClick={() => {
              navigate('/debt')
            }}
          >
            Depth charts
          </Button>
          <Button
            variant="text"
            color="success"
            sx={{fontWeight: 600, margin: '0 20px'}}
            onClick={() => {
              navigate('/matchup')
            }}
          >
            Match Ups
          </Button>
        </Toolbar>
        {dataLoading && (
          <Stack sx={{color: 'grey.500', width: '100%'}}>
            {/* <CircularProgress color="success" /> */}

            <LinearProgress color="success" />
          </Stack>
        )}
      </AppBar>

      <Routes>
        <Route path="/" element={<Teams />} />
        <Route path="/debt" element={<DeptCharts />} />
        <Route path="/matchup" element={<MatchUps />} />
      </Routes>
    </div>
  )
}

export default App
