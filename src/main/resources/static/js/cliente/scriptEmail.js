document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
        nombre: form.nombre.value,
        email: form.email.value,
        mensaje: form.mensaje.value
    };

    try {
        const res = await fetch('http://localhost:3001/contacto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        showToast("success", "Mensaje enviado", result.message || "Tu mensaje fue enviado correctamente.");

        form.reset();

    } catch (err) {
        console.error(err);
        showToast("error", "Error", "Hubo un problema al enviar el mensaje.");
    }
});
