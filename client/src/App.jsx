import React from 'react'
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom'
import Compiler from './Pages/Compiler'
import Landing from './Pages/Landing'
import About from './Pages/About'
import Feedback from './Pages/Feedback'
import ContactSupport from './Pages/Contact'
 import CopyRight from './Pages/Copyright'

function App() {
  

  return (
  <Router>
    <Routes>
    <Route path="/home" element={<Landing/>} />
      <Route path="/" element={<Compiler/>} >
        <Route path="about" element={<About/>} />
        <Route path="feedback" element={<Feedback/>} />
        <Route path="contact" element={<ContactSupport/>} />
        <Route path="copyright" element={<CopyRight/>} />
      </Route>
    </Routes>
  </Router>

  )
}

export default App
