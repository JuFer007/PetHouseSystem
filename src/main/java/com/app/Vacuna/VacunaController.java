package com.app.Vacuna;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vacunas")
@RequiredArgsConstructor

public class VacunaController {
    private final VacunaService vacunaService;

    @GetMapping
    public ResponseEntity<List<Vacuna>> findAll() {
        List<Vacuna> vacunas = vacunaService.findAll();
        return ResponseEntity.ok(vacunas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vacuna> findById(@PathVariable Long id) {
        try {
            Vacuna vacuna = vacunaService.findById(id);
            return ResponseEntity.ok(vacuna);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Vacuna>> findByNombre(@RequestParam String nombre) {
        List<Vacuna> vacunas = vacunaService.findByNombre(nombre);
        return ResponseEntity.ok(vacunas);
    }

    @PostMapping
    public ResponseEntity<Vacuna> save(@RequestBody Vacuna vacuna) {
        Vacuna nuevaVacuna = vacunaService.save(vacuna);
        return ResponseEntity.ok(nuevaVacuna);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vacuna> update(@PathVariable Long id, @RequestBody Vacuna vacuna) {
        try {
            Vacuna actualizada = vacunaService.update(id, vacuna);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vacunaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
