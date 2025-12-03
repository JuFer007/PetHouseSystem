const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs")
const port = 3000;

const app = express();
app.use(cors());

const IMAGES_FOLDER = path.join(__dirname, "fondos");

app.use("/fondos", express.static(IMAGES_FOLDER));

app.get("/api/fondos", (req, res) => {
    fs.readdir(IMAGES_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Error leyendo la carpeta" });
        }

        const imagenes = files.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        const urls = imagenes.map(img => `http://localhost:3000/fondos/${img}`);
        res.json(urls);
    });
});

app.get("/api/fondo/random", (req, res) => {
    fs.readdir(IMAGES_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Error leyendo la carpeta" });
        }

        const imagenes = files.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        const random = Math.floor(Math.random() * imagenes.length);
        res.json({ url: `http://localhost:3000/fondos/${imagenes[random]}` });
    });
});

app.listen(port, () => {
    console.log("Servidor listo en http://localhost:3000");
});
