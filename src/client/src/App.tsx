import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Home/>} />

        {/*Logout*/}

        
        {/*Protected routes*/}

      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
