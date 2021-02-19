import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";

// import bootstrap css
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./app";

const Index = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
