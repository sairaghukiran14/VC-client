import "./App.css";
import { Routes, Route } from "react-router-dom";
import Lobby from "./Components/Lobby";
import Room from "./Components/Room";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomID" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
