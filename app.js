const express = require("express");
const app = express();
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`now listening for requests on port: ${PORT}`)
});