const fs = require('fs');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3004;
const path = require('path');

app.use(cors());

const API_KEY = fs.readFileSync(path.join(__dirname, 'token.txt'), 'utf-8').trim();

app.get('/clima', async (req, res) => {
    const ciudad = req.query.ciudad || 'Chiclayo';

    try {
        const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${ciudad}&lang=es`;
        const response = await axios.get(url);
        const data = response.data;

        const clima = {
            ciudad: data.location.name,
            condicion: data.current.condition.text,
            condicion_icon: data.current.condition.icon,
            temperatura: data.current.temp_c,
            humedad: data.current.humidity,
            viento: data.current.wind_kph
        };

        res.json(clima);
    } catch (error) {
        console.error('Error al obtener el clima:', error.message);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Servidor de clima corriendo en http://localhost:${port}`);
});
