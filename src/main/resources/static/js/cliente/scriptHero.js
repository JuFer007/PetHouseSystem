let fondos = [];
let indexFondo = 0;

async function cargarFondos() {
    const res = await fetch("http://localhost:3000/api/fondos");
    fondos = await res.json();

    cambiarFondo();
    setInterval(cambiarFondo, 6000);
}

function cambiarFondo() {
    const section = document.getElementById("inicio");
    section.style.backgroundImage = `url('${fondos[indexFondo]}')`;
    indexFondo = (indexFondo + 1) % fondos.length;
}

cargarFondos();
