const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require('path');
const port = 3002;

const app = express();
app.use(cors({origin: "http://localhost:8080"}));
app.use(express.json());

const TOKEN = fs.readFileSync(path.join(__dirname, 'token.txt'), 'utf-8').trim();

app.get("/dni/:numero", async (req, res) => {
  const { numero } = req.params;

  try {
    const response = await axios.get("https://api.decolecta.com/v1/reniec/dni", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      params: {
        numero: numero,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error al consultar DNI:", error.message);

    if (error.response) {
      console.error(error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Error al consultar DNI" });
    }
  }
});

app.listen(port, () => {
  console.log("Servidor corriendo en http://localhost:3002");
});
