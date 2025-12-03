async function cargarClima() {
    try {
        const res = await fetch('http://localhost:3004/clima?ciudad=Chiclayo');
        const data = await res.json();

        document.getElementById('tempClima').textContent = `${data.temperatura}°C`;
        document.getElementById('iconClima').src = `https:${data.condicion_icon || data.condicion.icon}`;
    } catch (error) {
        console.error('Error al cargar el clima', error);
    }
}

cargarClima();
