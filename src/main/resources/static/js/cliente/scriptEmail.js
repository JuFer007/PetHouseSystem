async function precargarDatosContacto() {
    const usuario = await window.SistemaAutenticacion.verificarSesion();
    
    if (usuario && usuario.cliente) {
        const nombreCompleto = `${usuario.cliente.nombre} ${usuario.cliente.apellido}`;
        
        const inputNombre = document.querySelector('#contactForm input[name="nombre"]');
        const inputEmail = document.querySelector('#contactForm input[name="email"]');
        
        if (inputNombre && inputEmail) {
            inputNombre.value = nombreCompleto;
            inputEmail.value = usuario.correoElectronico;
            
            inputNombre.readOnly = true;
            inputEmail.readOnly = true;
            
            inputNombre.classList.add('bg-gray-50');
            inputEmail.classList.add('bg-gray-50');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(precargarDatosContacto, 500);
});

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

        form.mensaje.value = '';
        form.nombre.value = '';
        form.email.value = '';
    } catch (err) {
        console.error(err);
        showToast("error", "Error", "Hubo un problema al enviar el mensaje.");
    }
});
