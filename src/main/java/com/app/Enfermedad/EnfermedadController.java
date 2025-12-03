package com.app.Enfermedad;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enfermedades")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class EnfermedadController {
    private final EnfermedadService enfermedadService;

    @GetMapping
    public ResponseEntity<List<Enfermedad>> findAll() {
        return ResponseEntity.ok(enfermedadService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enfermedad> findById(@PathVariable Long id) {
        return ResponseEntity.ok(enfermedadService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Enfermedad> save(@RequestBody Enfermedad enfermedad) {
        return ResponseEntity.ok(enfermedadService.save(enfermedad));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Enfermedad> update(@PathVariable Long id, @RequestBody Enfermedad enfermedad) {
        return ResponseEntity.ok(enfermedadService.update(id, enfermedad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        enfermedadService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Enfermedad>> findByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(enfermedadService.findByNombre(nombre));
    }
}
