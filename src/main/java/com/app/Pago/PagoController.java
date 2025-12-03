package com.app.Pago;
import com.app.DTO.PagoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor

public class PagoController {
    private final PagoService pagoService;

    @GetMapping()
    public ResponseEntity<List<PagoDTO>> findAllDTO() {
        return ResponseEntity.ok(pagoService.findAllDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> findById(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.findById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Pago>> findByClienteId(@PathVariable Long clienteId) {
        return ResponseEntity.ok(pagoService.findByClienteId(clienteId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Pago>> findByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(pagoService.findByEstado(estado));
    }

    @GetMapping("/rango")
    public ResponseEntity<List<Pago>> findByFechaBetween(@RequestParam LocalDateTime inicio, @RequestParam LocalDateTime fin) {
        return ResponseEntity.ok(pagoService.findByFechaBetween(inicio, fin));
    }

    @GetMapping("/metodo/{metodoPago}")
    public ResponseEntity<List<Pago>> findByMetodoPago(@PathVariable String metodoPago) {
        return ResponseEntity.ok(pagoService.findByMetodoPago(metodoPago));
    }

    @PostMapping
    public ResponseEntity<Pago> save(@RequestBody Pago pago) {
        return ResponseEntity.ok(pagoService.save(pago));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> update(@PathVariable Long id, @RequestBody Pago pago) {
        return ResponseEntity.ok(pagoService.update(id, pago));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pago> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        return ResponseEntity.ok(pagoService.cambiarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        pagoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
