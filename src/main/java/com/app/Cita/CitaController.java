package com.app.Cita;
import com.app.DTO.CitaDTO;
import com.app.DTO.CitaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {
    private final CitaService citaService;

    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> findAll() {
        return ResponseEntity.ok(citaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.findById(id));
    }

    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<CitaResponseDTO>> findByMascota(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(citaService.findByMascotaId(mascotaId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<CitaResponseDTO>> findByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(citaService.findByEstado(estado));
    }

    @GetMapping("/rango")
    public ResponseEntity<List<CitaResponseDTO>> findByFechaBetween(
            @RequestParam String inicio,
            @RequestParam String fin
    ) {
        LocalDate fechaInicio = LocalDate.parse(inicio.substring(0, 10));
        LocalDate fechaFin = LocalDate.parse(fin.substring(0, 10));
        return ResponseEntity.ok(citaService.findByFechaBetween(fechaInicio, fechaFin));
    }

    @PostMapping
    public ResponseEntity<Cita> save(@RequestBody CitaDTO dto) {
        Cita citaGuardada = citaService.save(dto);
        return ResponseEntity.ok(citaGuardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> update(@PathVariable Long id, @RequestBody Cita cita) {
        return ResponseEntity.ok(citaService.update(id, cita));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        citaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/veterinario/{id}")
    public ResponseEntity<List<CitaResponseDTO>> findByVeterinario(@PathVariable Long id) {
        return ResponseEntity.ok(
                citaService.findByVeterinarioId(id)
        );
    }
}