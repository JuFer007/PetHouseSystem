const btn = document.getElementById("btnNotificaciones");
const dropdown = document.getElementById("dropdownNotificaciones");
const badge = document.getElementById("badgeNotificaciones");

btn.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
    if (!btn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add("hidden");
    }
});

async function cargarNotificaciones() {
    try {
        const res = await fetch("http://localhost:3001/mensajes");
        const mensajes = await res.json();

        const lista = document.getElementById("listaNotificaciones");
        lista.innerHTML = "";

        if (mensajes.length > 0) {
            badge.textContent = mensajes.length;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }

        const ultimas = mensajes.slice(-10).reverse();
        if (ultimas.length === 0) {
            lista.innerHTML = `
                <li class="px-4 py-3 text-gray-500 text-center">
                    No hay notificaciones nuevas
                </li>
            `;
            return;
        }

        ultimas.forEach(msg => {
            const li = document.createElement("li");
            li.className = "px-4 py-3 border-b hover:bg-gray-50 cursor-pointer";
            li.innerHTML = `
                <p class="font-semibold text-gray-800">${msg.nombre} (${msg.email})</p>
                <p class="text-sm text-gray-500">${msg.mensaje}</p>
            `;
            lista.appendChild(li);
        });

    } catch (error) {
        console.error("Error cargando notificaciones:", error);
    }
}

btn.addEventListener("click", cargarNotificaciones);
