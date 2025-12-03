const productosContainer = document.getElementById("productos-container");

fetch("http://localhost:8080/api/productos")
.then(res => res.json())
.then(productos => {
    productosContainer.innerHTML = "";

    productos.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("bg-gray-50", "rounded-2xl", "overflow-hidden", "shadow-lg", "card-hover");

        const stockBadge = p.stock > 0
            ? `<span class="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Stock: ${p.stock}</span>`
            : `<span class="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Sin stock</span>`;

        card.innerHTML = `
            <div class="relative">
                <img src="http://localhost:8080/imagenesProductos/${p.urlImagen}"
                     alt="${p.nombre}"
                     class="w-full product-img">
                ${stockBadge}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 text-gray-800">${p.nombre}</h3>
                <p class="text-gray-600 mb-4">${p.categoria}</p>
                <div class="flex items-center justify-between">
                    <span class="text-2xl font-bold text-cyan-500">S/. ${p.precio.toFixed(2)}</span>
                    <button
                        onclick="addToCart(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock}, '${p.urlImagen}')"
                        class="btn-primary px-6 py-2 rounded-full ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${p.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus mr-2"></i>Agregar
                    </button>
                </div>
            </div>
        `;
        productosContainer.appendChild(card);
    });
})
.catch(error => {
    console.error('Error al cargar productos:', error);
    productosContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p class="text-gray-600">Error al cargar los productos</p>
        </div>
    `;
});
