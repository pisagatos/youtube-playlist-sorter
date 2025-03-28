import React from "react"
import { createRoot } from 'react-dom/client';

// Bootstrap needs jquery:
// http://stackoverflow.com/questions/34120250/error-using-bootstrap-jquery-packages-in-es6-with-browserify
import $ from "jquery"
window.jQuery = window.$ = $
require("bootstrap")

const root = createRoot(document.getElementById("main"));
root.render(<Routes />);
