const fs=require("fs");
const express= require("express");
const cors = require('cors');
const {json} = require("react-router-dom");
const datei ="shells.txt";
const PORT = process.env.PORT || 3333;

const shellsString=fs.readFileSync(datei, "utf-8");
const app = express();
app.use(cors());

app.get("/shells", (req, res) => {
    console.log("Vorgang startet");
    res.send(shellsString);
});
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});