import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import React from "react";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";


dayjs.extend(relativeTime);

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    {/* HelmetProvider must be the outermost provider */}
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </StrictMode>
);