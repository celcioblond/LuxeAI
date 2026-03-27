import {BrowserRouter as Router, Route} from "react-router-dom";
import Register from "./pages/Auth/Register";

const App = () => {
  return (
    <Router>
      <Route path="/register">
        <Register />
      </Route>
    </Router>
  )
}

export default App;