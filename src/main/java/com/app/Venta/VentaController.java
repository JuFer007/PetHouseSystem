package com.app.Venta;
import com.app.DTO.VentaRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ventas")

public class VentaController {
    private final VentaService ventaService;

    @GetMapping
    public ResponseEntity<List<Venta>> getAll() {
        return ResponseEntity.ok(ventaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.findById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Venta>> getByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ventaService.findByClienteId(clienteId));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<Venta>> getByFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(ventaService.findByFechaBetween(inicio, fin));
    }

    @PostMapping
    public ResponseEntity<Venta> create(@RequestBody Venta venta) {
        return ResponseEntity.ok(ventaService.save(venta));
    }

    @PostMapping("/procesar")
    public ResponseEntity<Venta> procesarVenta(@RequestBody VentaRequestDTO request) {
        try {
            Venta venta = ventaService.procesarVenta(request);
            return ResponseEntity.ok(venta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ventaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Double> total() {
        return ResponseEntity.ok(ventaService.sumaTotal());
    }
}
