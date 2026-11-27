const express = require("express");
const { config } = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

config();

const pool = require("./config/config.js");
const routes = require("./routes/index.js");

const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Server Online");
});

//Prueba conexion BD
/*app.get("/cafeteria", async (req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`Nombre de la BD: ${result.rows[0].current_database}`);
});
app.get("/cafeteria", async (req, res) => {
    const result = await pool.query("SELECT * FROM ");
    res.json(result.rows);
});*/

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
