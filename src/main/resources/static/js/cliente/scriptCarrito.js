class CarritoCompras {
    constructor() {
        this.items = this.cargarCarrito();
        this.actualizarUI();
    }

    cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    agregarProducto(producto) {
        const itemExistente = this.items.find(item => item.productoId === producto.id);

        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock) {
                itemExistente.cantidad++;
                itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
                showToast('success', 'Cantidad actualizada', `Cantidad actualizada a ${itemExistente.cantidad}`);
            } else {
                showToast('error', 'Stock insuficiente', 'No hay suficiente stock para este producto');
                return;
            }
        } else {
            if (producto.stock > 0) {
                this.items.push({
                    productoId: producto.id,
                    nombreProducto: producto.nombre,
                    cantidad: 1,
                    precioUnitario: producto.precio,
                    subtotal: producto.precio,
                    urlImagen: producto.urlImagen,
                    stockDisponible: producto.stock
                });
                showToast('success', 'Producto agregado', 'El producto se agregó correctamente al carrito');
            } else {
                showToast('error', 'Producto sin stock', 'Este producto no tiene stock disponible');
                return;
            }
        }

        this.guardarCarrito();
        this.actualizarUI();
    }

    actualizarCantidad(productoId, nuevaCantidad) {
        const item = this.items.find(i => i.productoId === productoId);

        if (item) {
            if (nuevaCantidad <= 0) {
                this.eliminarProducto(productoId);
            } else if (nuevaCantidad <= item.stockDisponible) {
                item.cantidad = nuevaCantidad;
                item.subtotal = item.cantidad * item.precioUnitario;
                this.guardarCarrito();
                this.actualizarUI();
                showToast('success', 'Cantidad actualizada', `Cantidad actualizada a ${item.cantidad}`);
            } else {
                showToast('error', 'Stock insuficiente', 'No hay suficiente stock para este producto');
            }
        }
    }

    eliminarProducto(productoId) {
        this.items = this.items.filter(item => item.productoId !== productoId);
        this.guardarCarrito();
        this.actualizarUI();
        showToast('info', 'Producto eliminado', 'El producto fue eliminado del carrito');
    }

    vaciarCarrito() {
        this.items = [];
        this.guardarCarrito();
        this.actualizarUI();
        showToast('info', 'Carrito vaciado', 'Todos los productos fueron eliminados');
    }

    calcularTotales() {
        const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        return {
            subtotal: subtotal,
            total: subtotal
        };
    }

    actualizarUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const emptyState = document.getElementById('empty-cart-state');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTotal = document.getElementById('cart-total');

        const totalItems = this.items.reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

        if (this.items.length === 0) {
            emptyState.style.display = 'flex';
            cartItems.querySelectorAll('.cart-item').forEach(item => item.remove());
        } else {
            emptyState.style.display = 'none';
            this.renderizarItems(cartItems);
        }

        const totales = this.calcularTotales();
        cartSubtotal.textContent = `S/. ${totales.subtotal.toFixed(2)}`;
        cartTotal.textContent = `S/. ${totales.total.toFixed(2)}`;
    }

    renderizarItems(container) {
        container.querySelectorAll('.cart-item').forEach(item => item.remove());

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item bg-white rounded-lg p-3 mb-3 shadow-sm';
            itemElement.innerHTML = `
                <div class="flex gap-3">
                    <img src="http://localhost:8080/imagenesProductos/${item.urlImagen}"
                         alt="${item.nombreProducto}"
                         class="w-20 h-20 object-cover rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 text-sm mb-1">${item.nombreProducto}</h4>
                        <p class="text-cyan-500 font-bold text-sm mb-2">S/. ${item.precioUnitario.toFixed(2)}</p>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <button onclick="carrito.actualizarCantidad(${item.productoId}, ${item.cantidad - 1})"
                                        class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center transition">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <span class="font-semibold text-sm w-8 text-center">${item.cantidad}</span>
                                <button onclick="carrito.actualizarCantidad(${item.productoId}, ${item.cantidad + 1})"
                                        class="w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center transition">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                            <button onclick="carrito.eliminarProducto(${item.productoId})"
                                    class="text-red-500 transition">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                        <p class="text-gray-600 text-xs mt-1">Subtotal: S/. ${item.subtotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
            container.insertBefore(itemElement, container.querySelector('#empty-cart-state'));
        });
    }

    obtenerItemsParaVenta() {
        return this.items.map(item => ({
            productoId: item.productoId,
            nombreProducto: item.nombreProducto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal
        }));
    }
}

const carrito = new CarritoCompras();

function openCartModal() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
    document.body.style.overflow = '';
}

function addToCart(productoId, nombre, precio, stock, urlImagen) {
    carrito.agregarProducto({
        id: productoId,
        nombre: nombre,
        precio: precio,
        stock: stock,
        urlImagen: urlImagen
    });
}

function checkout() {
    if (carrito.items.length === 0) {
        showToast('error', 'Carrito vacío', 'El carrito está vacío');
        return;
    }
    openPaymentModal();
}

function openPaymentModal() {
    document.getElementById('paymentModal').classList.add('active');
    const totales = carrito.calcularTotales();
    document.getElementById('payment-total').textContent = `S/. ${totales.total.toFixed(2)}`;
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.getElementById('formPago').reset();
    document.querySelectorAll('.payment-method').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('metodo-pago-seleccionado').value = '';
}

function selectPaymentMethod(metodo, event) {
    document.querySelectorAll('.payment-method').forEach(btn => {
        btn.classList.remove('selected');
    });

    event.target.closest('.payment-method').classList.add('selected');
    document.getElementById('metodo-pago-seleccionado').value = metodo;
}

async function procesarPago(event) {
    event.preventDefault();

    const metodoPago = document.getElementById('metodo-pago-seleccionado').value;

    if (!metodoPago) {
        showToast('error', 'Método de pago', 'Selecciona un método de pago');
        return;
    }

    const clienteId = localStorage.getItem('clienteId') || 1;

    const ventaData = {
        clienteId: parseInt(clienteId),
        metodoPago: metodoPago,
        items: carrito.obtenerItemsParaVenta()
    };

    try {
        const response = await fetch('http://localhost:8080/api/ventas/procesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaData)
        });

        if (response.ok) {
            carrito.vaciarCarrito();
            closePaymentModal();
            closeCartModal();
            showToast('success', 'Compra exitosa', '¡Compra realizada con éxito!');
        } else {
            showToast('error', 'Error', 'Error al procesar la compra');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartModal();
        closePaymentModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});
