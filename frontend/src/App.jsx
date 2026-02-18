import { useState } from "react";
import { FaHome, FaBars } from "react-icons/fa";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="menu-toggle" onClick={() => setOpen(!open)}>
          <FaBars />
        </div>

        <div className="menu-item">
          <FaHome />
          {open && <span>Home</span>}
        </div>
      </aside>

      <main className="content">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
