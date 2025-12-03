const express = require('express');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3006;

const catToken = fs.readFileSync(path.join(__dirname, 'token.txt'), 'utf-8').trim();

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

app.get('/cat/:breed', async (req, res) => {
    const { breed } = req.params;

    try {
        const response = await axios.get(`https://api.thecatapi.com/v1/images/search?breed_ids=${breed}`, {
            headers: { 'x-api-key': catToken }
        });

        if (response.data.length > 0) {
            res.json({ url: response.data[0].url });
        } else {
            res.status(404).json({ message: "No se encontró imagen para esa raza" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error obteniendo imagen de gato", error: error.message });
    }
});

app.get('/dog/:breed', async (req, res) => {
    const { breed } = req.params;

    try {
        const response = await axios.get(`https://dog.ceo/api/breed/${breed.toLowerCase()}/images/random`);

        if (response.data && response.data.status === "success") {
            res.json({ url: response.data.message });
        } else {
            res.status(404).json({ message: "No se encontró imagen para esa raza" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error obteniendo imagen de perro", error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
