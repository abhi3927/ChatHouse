import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import store from "./redux/store";

// Backend base URL without trailing slashes. Only read inside functions/effects
// elsewhere, because App imports this module while it is still loading.
export const BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
