let mascotaActual = null;

// Mapas de coincidencia de razas
const mapRazasPerro = {
    husky: ["husky", "haski"],
    labrador: ["labrador", "lab"],
    cocker: ["cocker", "cocker spaniel"],
    shihtzu: ["shih tzu", "shihtzu"],
    bulldog: ["bulldog", "buldog"],
    poodle: ["poodle", "caniche"],
    beagle: ["beagle"],
    rottweiler: ["rottweiler", "rott"],
    golden: ["golden", "golden retriever"],
    chihuahua: ["chihuahua", "chiuahua"]
};

const mapRazasGato = {
    bengal: ["bengal", "bengalí"],
    persa: ["persa", "persian"],
    siamese: ["siamese", "siames"],
    sphynx: ["sphynx", "esfinge"],
    mainecoon: ["maine coon", "mainecoon"],
    ragdoll: ["ragdoll"],
    british: ["british", "british shorthair"],
    scottish: ["scottish", "scottish fold"],
    burmese: ["burmese", "birmano"],
    norwegian: ["norwegian", "norwegian forest"]
};

// Función para buscar coincidencia
function buscarRazaCoincidente(nombreRaza, mapRazas) {
    const razaLower = nombreRaza.toLowerCase();
    for (const [key, variantes] of Object.entries(mapRazas)) {
        if (variantes.some(v => razaLower.includes(v))) return key;
    }
    return null;
}

// Función para obtener imagen según especie y raza
async function obtenerImagenMascota(mascota) {
    const { especie, raza } = mascota;
    const especieLower = especie.toLowerCase();

    try {
        if (especieLower.includes('perro')) {
            const razaApi = buscarRazaCoincidente(raza, mapRazasPerro);
            if (razaApi) {
                const res = await fetch(`https://dog.ceo/api/breed/${razaApi}/images/random`);
                const data = await res.json();
                if (data.status === "success") return data.message;
            }
            const defaultPerros = [
                "https://images.dog.ceo/breeds/husky/n02110185_1469.jpg",
                "https://images.dog.ceo/breeds/labrador/n02099712_5460.jpg",
                "https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg"
            ];
            return defaultPerros[Math.floor(Math.random() * defaultPerros.length)];

        } else if (especieLower.includes('gato')) {
            const razaApi = buscarRazaCoincidente(raza, mapRazasGato);
            const catToken = await fetch('/token.txt').then(r => r.text()).then(t => t.trim());

            if (razaApi) {
                const res = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${razaApi}`, {
                    headers: { 'x-api-key': catToken }
                });
                const data = await res.json();
                if (data.length > 0) return data[0].url;
            }
            const defaultGatos = [
                "https://cdn2.thecatapi.com/images/beng.jpg",
                "https://cdn2.thecatapi.com/images/pers.jpg",
                "https://cdn2.thecatapi.com/images/siam.jpg"
            ];
            return defaultGatos[Math.floor(Math.random() * defaultGatos.length)];

        } else if (especieLower.includes('ave') || especieLower.includes('pájaro')) {
            const defaultAves = [
                "https://upload.wikimedia.org/wikipedia/commons/3/32/House_sparrow04.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/2/2e/Canary_bird.jpg"
            ];
            return defaultAves[Math.floor(Math.random() * defaultAves.length)];

        } else if (especieLower.includes('pez')) {
            const defaultPeces = [
                "https://upload.wikimedia.org/wikipedia/commons/7/7e/Clown_fish_in_aquarium.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/3/38/Goldfish3.jpg"
            ];
            return defaultPeces[Math.floor(Math.random() * defaultPeces.length)];

        } else {
            return "https://upload.wikimedia.org/wikipedia/commons/6/66/Generic_pet_image.png";
        }

    } catch (err) {
        console.error('Error obteniendo imagen:', err);
        return "https://upload.wikimedia.org/wikipedia/commons/6/66/Generic_pet_image.png";
    }
}

// Función para cargar mascotas
async function cargarMascotas() {
    try {
        const response = await fetch('/api/clientes/clienteMascota');
        const clientes = await response.json();
        const contenedor = document.getElementById('contenedor-mascotas');
        contenedor.innerHTML = '';

        for (const cliente of clientes) {
            const nombreDueno = `${cliente.nombre} ${cliente.apellido}`;
            for (const mascota of cliente.mascotas) {

                const imagenMascota = await obtenerImagenMascota(mascota);

                const card = document.createElement('div');
                card.classList.add(
                    'chart-container',
                    'module-card',
                    'cursor-pointer',
                    'hover:shadow-lg',
                    'transition-shadow'
                );

                card.onclick = () =>
                    abrirModalEditarMascota(mascota.id, nombreDueno, cliente.id);

                card.innerHTML = `
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-800">${mascota.nombre}</h4>
                            <p class="text-sm text-gray-500">${mascota.raza}</p>
                        </div>
                        <div class="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
                            <img src="${imagenMascota}" alt="${mascota.nombre}" class="object-cover w-full h-full">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm text-gray-600"><span class="font-semibold">Dueño:</span> ${nombreDueno}</p>
                        <p class="text-sm text-gray-600"><span class="font-semibold">Especie:</span> ${mascota.especie}</p>
                        <p class="text-sm text-gray-600">
                          <span class="font-semibold">Edad:</span>
                          ${mascota.edad} ${mascota.edad === 1 ? 'año' : 'años'}
                        </p>
                    </div>
                `;

                contenedor.appendChild(card);
            }
        }

        console.log(`${contenedor.children.length} mascotas cargadas`);

    } catch (error) {
        console.error('Error cargando mascotas:', error);
    }
}

// Funciones para abrir y cerrar modal
function abrirModalEditarMascota(mascotaId, nombreDueno, clienteId) {
    fetch(`/api/mascotas/${mascotaId}`)
        .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
        .then(mascota => {
            mascotaActual = {
                id: mascota.id,
                nombre: mascota.nombre,
                especie: mascota.especie,
                raza: mascota.raza,
                edad: mascota.edad,
                clienteId: clienteId
            };

            document.getElementById('editarNombreMascota').value = mascota.nombre || '';
            document.getElementById('editarEspecie').value = mascota.especie || '';
            document.getElementById('editarRaza').value = mascota.raza || '';
            document.getElementById('editarEdadMascota').value = mascota.edad ?? '';
            document.getElementById('editarDueno').value = nombreDueno;

            const modal = document.getElementById('modalEditarMascota');
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        })
        .catch(err => console.error('❌ Error al cargar mascota:', err));
}

function cerrarModalMascota() {
    const modal = document.getElementById('modalEditarMascota');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    mascotaActual = null;

    document.getElementById('errorNombreMascota')?.classList.add('hidden');
    document.getElementById('errorEdadMascota')?.classList.add('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarMascotas();

    const inputNombre = document.getElementById('editarNombreMascota');
    const inputEdad = document.getElementById('editarEdadMascota');
    const errorNombre = document.getElementById('errorNombreMascota');
    const errorEdad = document.getElementById('errorEdadMascota');

    inputNombre?.addEventListener('input', () => {
        const valido = inputNombre.value.trim().length > 0;
        errorNombre.classList.toggle('hidden', valido);
        inputNombre.classList.toggle('border-red-500', !valido);
    });

    inputEdad?.addEventListener('input', () => {
        inputEdad.value = inputEdad.value.replace(/[^0-9]/g, '');
        const edad = parseInt(inputEdad.value);
        const valido = !isNaN(edad) && edad >= 0 && edad <= 30;
        errorEdad.classList.toggle('hidden', valido);
        inputEdad.classList.toggle('border-red-500', !valido);
    });

    document.getElementById('btnCerrarMascotaX')?.addEventListener('click', cerrarModalMascota);
    document.getElementById('btnCancelarMascota')?.addEventListener('click', cerrarModalMascota);

    document.getElementById('modalEditarMascota')?.addEventListener('click', e => {
        if (e.target.id === 'modalEditarMascota') cerrarModalMascota();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') cerrarModalMascota();
    });

    document.getElementById('formEditarMascota')?.addEventListener('submit', e => {
        e.preventDefault();
        if (!mascotaActual) return;

        const nombre = inputNombre.value.trim();
        const edad = parseInt(inputEdad.value);
        if (!nombre || isNaN(edad) || edad < 0 || edad > 30) return;

        fetch(`/api/mascotas/${mascotaActual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...mascotaActual, nombre, edad })
        })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(() => {
            cerrarModalMascota();
            cargarMascotas();
            showToast?.("success","Mascota actualizada","Datos guardados correctamente");
        })
        .catch(() => {
            showToast?.("error","Error","No se pudo actualizar");
        });
    });
});
