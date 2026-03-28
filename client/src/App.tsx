import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Homepage from "./pages/Core/Homepage";
import Register from "./pages/Auth/Register";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/" element={<Navigate to="/homepage" />} />
      </Routes>
    </Router>
  );
}

export default App;