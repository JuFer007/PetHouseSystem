const express = require('express');
const fs = require('fs');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

const respuestasPath = path.join(__dirname, 'respuestas.json');
const mensajesPath = path.join(__dirname, 'mensajes.json');

const apiKey = process.env.API_KEY || fs.readFileSync(path.join(__dirname, 'access_token.txt'), 'utf-8').trim();
const mailerSend = new MailerSend({ apiKey });
const sentFrom = new Sender("info@test-y7zpl9893m045vx6.mlsender.net", "PetHouse");

const respuestasAutomaticas = JSON.parse(fs.readFileSync(respuestasPath, 'utf-8'));

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function guardarMensaje(data) {
    let lista = [];

    try {
        if (fs.existsSync(mensajesPath)) {
            lista = JSON.parse(fs.readFileSync(mensajesPath, 'utf-8'));
        }
    } catch (e) {
        console.log("Error leyendo mensajes.json:", e);
    }

    lista.push(data);

    fs.writeFileSync(mensajesPath, JSON.stringify(lista, null, 2));
}

app.post('/contacto', async (req, res) => {
    const { nombre, email, telefono, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    try {
        const texto = mensaje.toLowerCase();

        let respuestaSeleccionada = respuestasAutomaticas.default;

        for (const [key, data] of Object.entries(respuestasAutomaticas)) {
            if (key === 'default') continue;
            if (data.keywords.some(keyword => texto.includes(keyword))) {
                respuestaSeleccionada = data;
                break;
            }
        }

        const respuestaFinal = respuestaSeleccionada.mensaje
            .replace('{nombre}', nombre)
            .replace('{mensaje_original}', mensaje);

        const recipients = [new Recipient(email, nombre)];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(respuestaSeleccionada.asunto)
            .setHtml(`<div style="font-family: Arial; line-height: 1.6;">${respuestaFinal.replace(/\n/g, '<br>')}</div>`)
            .setText(respuestaFinal);

        await mailerSend.email.send(emailParams);

        guardarMensaje({
            nombre,
            email,
            telefono,
            mensaje,
            fecha: new Date().toISOString()
        });

        res.status(200).json({ message: "Mensaje recibido y respuesta automática enviada" });

    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({
            message: "Error enviando el mensaje",
            error: error.body || error.message || error
        });
    }
});

app.get('/mensajes', (req, res) => {
    try {
        const mensajes = JSON.parse(fs.readFileSync(mensajesPath, 'utf-8'));
        res.json(mensajes);
    } catch (error) {
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
