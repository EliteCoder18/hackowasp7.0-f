import React from 'react'
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom'
import Compiler from './Pages/Compiler'
import Landing from './Pages/Landing'
import About from './Pages/About'
import Feedback from './Pages/Feedback'
import ContactSupport from './Pages/Contact'

function App() {
  

  return (
  <Router>
    <Routes>
      <Route path="/" element={<Compiler/>} >
        <Route path="home" element={<Landing/>} />
        <Route path="about" element={<About/>} />
        <Route path="feedback" element={<Feedback/>} />
        <Route path="contact" element={<ContactSupport/>} />
      </Route>
    </Routes>
  </Router>

  )
}

export default App
