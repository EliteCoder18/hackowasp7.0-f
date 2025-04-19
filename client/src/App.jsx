
import React from 'react'
import {createBrowserRouter as Router , Routes , Route} from 'react-router-dom'
import Compiler from './Pages/Compiler'
import Landing from './Pages/Landing'

function App() {
  

  return (
  <Router>
    <Routes>
      <Route path="/app" element={<Compiler/>} >
        <Route path="home" element={<Landing/>} />
      </Route>
    </Routes>
  </Router>

  )
}

export default App
