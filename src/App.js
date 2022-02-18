import logo from './logo.svg'
import React, {useEffect} from 'react'
import {Routes, Route, useNavigate} from 'react-router-dom'
import './App.css'
import {AppBar} from '@mui/material'
import {Toolbar} from '@mui/material'
import {Button} from '@mui/material'
import Teams from './views/TeamsView'
import DeptCharts from './views/DeptChartsView'
import MatchUps from './views/MatchUpsView'

function App() {
  const navigate = useNavigate()

  return (
    <div className="App">
      <AppBar color="transparent" sx={{alignItems: 'center'}}>
        <Toolbar>
          <Button
            variant="text"
            onClick={() => {
              navigate('/')
            }}
          >
            Teams
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={() => {
              navigate('/debt')
            }}
          >
            Depth charts
          </Button>
          <Button
            variant="text"
            color="success"
            onClick={() => {
              navigate('/matchup')
            }}
          >
            Match Ups
          </Button>
        </Toolbar>
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
