package com.app.Mascota;
import com.app.DTO.HistoriaClinicaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@RequiredArgsConstructor

public class MascotaController {
    private final MascotaService mascotaService;

    @GetMapping
    public ResponseEntity<List<Mascota>> findAll() {
        return ResponseEntity.ok(mascotaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mascota> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mascotaService.findById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Mascota>> findByClienteId(@PathVariable Long clienteId) {
        return ResponseEntity.ok(mascotaService.findByClienteId(clienteId));
    }

    @GetMapping("/especie/{especie}")
    public ResponseEntity<List<Mascota>> findByEspecie(@PathVariable String especie) {
        return ResponseEntity.ok(mascotaService.findByEspecie(especie));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Mascota>> findByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(mascotaService.findByNombre(nombre));
    }

    @PostMapping
    public ResponseEntity<Mascota> save(@RequestBody Mascota mascota) {
        return ResponseEntity.ok(mascotaService.save(mascota));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mascota> update(@PathVariable Long id, @RequestBody Mascota mascota) {
        return ResponseEntity.ok(mascotaService.update(id, mascota));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        mascotaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historia")
    public ResponseEntity<HistoriaClinicaDTO> obtenerHistoriaClinica(@PathVariable Long id) {
        return ResponseEntity.ok(mascotaService.obtenerHistoriaClinica(id));
    }
}
