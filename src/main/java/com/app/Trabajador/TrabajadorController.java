package com.app.Trabajador;
import com.app.Enums.CargoTrabajador;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trabajadores")

public class TrabajadorController {
    private final TrabajadorService trabajadorService;

    @GetMapping
    public ResponseEntity<List<Trabajador>> getAll() {
        return ResponseEntity.ok(trabajadorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trabajador> getById(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.findById(id));
    }

    @GetMapping("/activo/{estado}")
    public ResponseEntity<List<Trabajador>> getByActivo(@PathVariable boolean estado) {
        return ResponseEntity.ok(trabajadorService.findByActivo(estado));
    }

    @GetMapping("/cargo/{cargo}")
    public ResponseEntity<List<Trabajador>> getByCargo(@PathVariable String cargo) {

        CargoTrabajador cargoEnum;

        try {
            cargoEnum = CargoTrabajador.valueOf(cargo.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(trabajadorService.findByCargo(CargoTrabajador.valueOf(String.valueOf(cargoEnum))));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Trabajador>> search(@RequestParam String texto) {
        return ResponseEntity.ok(trabajadorService.findByNombreOApellido(texto));
    }

    @PostMapping
    public ResponseEntity<Trabajador> create(@RequestBody Trabajador trabajador) {
        return ResponseEntity.ok(trabajadorService.save(trabajador));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trabajador> update(
            @PathVariable Long id,
            @RequestBody Trabajador trabajador) {

        return ResponseEntity.ok(trabajadorService.update(id, trabajador));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trabajadorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Trabajador> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.desactivar(id));
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<Trabajador> activar(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.activar(id));
    }
}
