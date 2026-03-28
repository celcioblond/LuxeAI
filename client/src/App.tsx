import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Auth/Register";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App;