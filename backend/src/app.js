const express = require("express");
const { config } = require("dotenv");
const cors = require("cors");
const pool = require("./config/config.js");
const routes = require("./routes/routes.js");

config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
    res.send("Server Online");
});

//Prueba conexion BD
/*app.get("/", async (req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`Nombre de la BD: ${result.rows[0].current_database}`);
});
app.get("/", async (req, res) => {
    const result = await pool.query("SELECT * FROM ");
    res.json(result.rows);
});*/

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
