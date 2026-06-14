import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "Lectra — 3D, AR & lesson builder for teachers";

createRoot(document.getElementById("root")!).render(<App />);
