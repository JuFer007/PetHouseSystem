package com.app.MascotaVacuna;
import com.app.DTO.MascotaVacunaDTO;
import com.app.Enums.EstadoVacuna;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas-vacunas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class MascotaVacunaController {
    private final MascotaVacunaService service;

    @GetMapping
    public ResponseEntity<List<MascotaVacunaDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MascotaVacunaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<MascotaVacunaDTO>> findByMascotaId(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(service.findByMascotaId(mascotaId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<MascotaVacunaDTO>> findByEstado(@PathVariable EstadoVacuna estado) {
        return ResponseEntity.ok(service.findByEstado(estado));
    }

    @GetMapping("/proximas/{dias}")
    public ResponseEntity<List<MascotaVacunaDTO>> findProximasVacunas(@PathVariable Integer dias) {
        return ResponseEntity.ok(service.findProximasVacunas(dias));
    }

    @GetMapping("/vencidas")
    public ResponseEntity<List<MascotaVacunaDTO>> findVacunasVencidas() {
        return ResponseEntity.ok(service.findVacunasVencidas());
    }

    @PostMapping
    public ResponseEntity<List<MascotaVacunaDTO>> save(@RequestBody MascotaVacunaDTO dto) {
        List<MascotaVacunaDTO> guardadas = service.save(dto);
        return ResponseEntity.ok(guardadas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MascotaVacunaDTO> update(@PathVariable Long id, @RequestBody MascotaVacunaDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
