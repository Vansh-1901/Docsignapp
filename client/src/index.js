// client/src/index.js or index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom"; // ✅ ADD THIS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {" "}
      {/* ✅ Wrap App in BrowserRouter */}
      <App />
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);
