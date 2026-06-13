import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const fontLink1 = document.createElement("link");
fontLink1.rel = "preconnect";
fontLink1.href = "https://fonts.googleapis.com";
document.head.appendChild(fontLink1);

const fontLink2 = document.createElement("link");
fontLink2.rel = "preconnect";
fontLink2.href = "https://fonts.gstatic.com";
fontLink2.crossOrigin = "anonymous";
document.head.appendChild(fontLink2);

const fontLink3 = document.createElement("link");
fontLink3.rel = "stylesheet";
fontLink3.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink3);

document.title = "Lectra — 3D, AR & lesson builder for teachers";

createRoot(document.getElementById("root")!).render(<App />);
