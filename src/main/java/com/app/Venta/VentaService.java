package com.app.Venta;
import com.app.DTO.CarritoItemDTO;
import com.app.DTO.VentaRequestDTO;
import com.app.DetalleVenta.DetalleVenta;
import com.app.DetalleVenta.DetalleVentaRepository;
import com.app.Producto.Producto;
import com.app.Producto.ProductoRepository;
import com.app.Producto.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("mysqlTransactionManager")
public class VentaService {
    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final ProductoRepository productoRepository;

    public List<Venta> findAll() {
        return ventaRepository.findAll();
    }

    public Venta findById(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
    }

    public List<Venta> findByClienteId(Long clienteId) {
        return ventaRepository.findByClienteId(clienteId);
    }

    public List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.findByFechaVentaBetween(inicio, fin);
    }

    public Venta save(Venta venta) {
        return ventaRepository.save(venta);
    }

    @Transactional
    public Venta procesarVenta(VentaRequestDTO request) {
        for (CarritoItemDTO item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getProductoId()));

            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }
        }

        // Crear venta
        Venta venta = Venta.builder()
                .clienteId(request.getClienteId())
                .fechaVenta(LocalDateTime.now())
                .metodoPago(request.getMetodoPago())
                .total(0.0)
                .detalles(new ArrayList<>())
                .build();

        double totalVenta = 0.0;

        for (CarritoItemDTO item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId()).get();

            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .subtotal(item.getSubtotal())
                    .build();

            venta.getDetalles().add(detalle);
            totalVenta += item.getSubtotal();

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);
        }

        venta.setTotal(totalVenta);
        return ventaRepository.save(venta);
    }

    public void deleteById(Long id) {
        ventaRepository.deleteById(id);
    }

    public Double sumaTotal() {
        return ventaRepository.sumarTotalVentas();
    }
}
