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
                "https://images.dog.ceo/breeds/poodle-medium/WhatsApp_Image_2022-08-06_at_4.48.38_PM.jpg",
                "https://images.dog.ceo/breeds/whippet/n02091134_9671.jpg"
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
                "https://img.freepik.com/foto-gratis/primer-disparo-vertical-lindo-gato-europeo-pelo-corto_181624-34587.jpg?semt=ais_hybrid&w=740&q=80",
                "https://www.anicura.es/cdn-cgi/image/f=auto,fit=cover,w=640,h=640,g=auto,sharpen=1/AdaptiveImages/powerinit/52437/_SNI2031.jpg?stamp=a2efc90c9d13cd9fdc0f5f7a2e3b2231238dc8cf",
            ];
            return defaultGatos[Math.floor(Math.random() * defaultGatos.length)];

        } else if (especieLower.includes('ave') || especieLower.includes('pájaro')) {
            const defaultAves = [
                "https://content.nationalgeographic.com.es/medio/2022/12/12/aves-1_0931d689_221212154441_1280x720.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Huismus%2C_man.jpg/1200px-Huismus%2C_man.jpg"
            ];
            return defaultAves[Math.floor(Math.random() * defaultAves.length)];

        } else if (especieLower.includes('pez')) {
            const defaultPeces = [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzEFSF7hZCYiPOnclzZzqJY7nsypmT3G942A&s",
                "https://cdn0.bioenciclopedia.com/es/posts/1/7/1/pez_payaso_171_orig.jpg"
            ];
            return defaultPeces[Math.floor(Math.random() * defaultPeces.length)];

        } else {
            return "https://upload.wikimedia.org/wikipedia/commons/6/66/Generic_pet_image.png";
        }

    } catch (err) {
        console.error('Error obteniendo imagen:', err);
        return "https://images.dog.ceo/breeds/terrier-boston/bostonTerrier_000001.jpg";
    }
}

//Función para cargar mascotas
async function cargarMascotas() {
    try {
        const response = await fetch('/api/clientes/clienteMascota');
        const clientes = await response.json();

        const contenedor = document.getElementById('contenedor-mascotas');
        contenedor.innerHTML = '';

        const cardsPromises = [];

        for (const cliente of clientes) {
            const nombreDueno = `${cliente.nombre} ${cliente.apellido}`;

            for (const mascota of cliente.mascotas) {

                cardsPromises.push(
                    (async () => {
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
                                    <img src="${imagenMascota}" alt="${mascota.nombre}"
                                         class="object-cover w-full h-full">
                                </div>
                            </div>

                            <div class="space-y-2">
                                <p class="text-sm text-gray-600">
                                    <span class="font-semibold">Dueño:</span> ${nombreDueno}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <span class="font-semibold">Especie:</span> ${mascota.especie}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <span class="font-semibold">Edad:</span>
                                    ${mascota.edad} ${mascota.edad === 1 ? 'año' : 'años'}
                                </p>
                            </div>
                        `;

                        return card;
                    })()
                );
            }
        }
        const cards = await Promise.all(cardsPromises);
        cards.forEach(card => contenedor.appendChild(card));
        console.log(`${cards.length} mascotas cargadas`);
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
                nombre: mascota.nombre.toLowerCase(),
                especie: mascota.especie.toLowerCase(),
                raza: mascota.raza.toLowerCase(),
                edad: mascota.edad,
                clienteId: clienteId
            };

            document.getElementById('editarNombreMascota').value = mascota.nombre.toUpperCase() || '';
            document.getElementById('editarEspecie').value = mascota.especie.toUpperCase() || '';
            document.getElementById('editarRaza').value = mascota.raza.toUpperCase() || '';
            document.getElementById('editarEdadMascota').value = mascota.edad ?? '';
            document.getElementById('editarDueno').value = nombreDueno;

            const modal = document.getElementById('modalEditarMascota');
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        })
        .catch(err => console.error('Error al cargar mascota:', err));
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

        const nombre = inputNombre.value.trim().toUpperCase();
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
