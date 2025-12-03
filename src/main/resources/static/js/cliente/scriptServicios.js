let serviciosDisponibles = [];
let servicioSeleccionadoId = null;

async function cargarServicios() {
    try {
        const response = await fetch("http://localhost:8080/api/servicios");
        serviciosDisponibles = (await response.json()).filter(servicio => servicio.activo);

        const contenedor = document.getElementById("servicios-container");
        contenedor.innerHTML = "";

        serviciosDisponibles.forEach(servicio => {
            contenedor.innerHTML += `
                <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover text-center group relative">
                    <div class="relative h-40 overflow-hidden">
                        <img src="http://localhost:8080/imagenesServicios/${servicio.imagenUrl}"
                             class="w-full h-full object-cover transition duration-300 group-hover:brightness-50">

                        <button onclick="abrirModalConServicio(${servicio.id})"
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition duration-300">
                            Reservar
                        </button>

                        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <i class="fas fa-paw text-2xl text-cyan-500"></i>
                        </div>
                    </div>

                    <div class="pt-10 pb-6 px-6">
                        <p style="display: none">${servicio.id}</p>
                        <h3 class="text-xl font-semibold mb-3 text-gray-800">${servicio.nombre}</h3>
                        <p class="text-gray-600">${servicio.descripcion}</p>
                    </div>
                </div>
            `;
        });

        cargarServiciosEnModal();
    } catch (error) {
        console.error("Error al cargar servicios:", error);
    }
}

cargarServicios();
