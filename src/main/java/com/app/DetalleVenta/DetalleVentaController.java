package com.app.DetalleVenta;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/detalles-venta")
@RequiredArgsConstructor

public class DetalleVentaController {
    private final DetalleVentaService detalleVentaService;

    @GetMapping
    public ResponseEntity<List<DetalleVenta>> findAll() {
        return ResponseEntity.ok(detalleVentaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleVenta> findById(@PathVariable Long id) {
        return ResponseEntity.ok(detalleVentaService.findById(id));
    }

    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<List<DetalleVenta>> findByVentaId(@PathVariable Long ventaId) {
        return ResponseEntity.ok(detalleVentaService.findByVentaId(ventaId));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<DetalleVenta>> findByProductoId(@PathVariable Long productoId) {
        return ResponseEntity.ok(detalleVentaService.findByProductoId(productoId));
    }

    @PostMapping
    public ResponseEntity<DetalleVenta> save(@RequestBody DetalleVenta detalleVenta) {
        return ResponseEntity.ok(detalleVentaService.save(detalleVenta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        detalleVentaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
