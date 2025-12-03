package com.app.MascotaEnfermedad;
import com.app.DTO.MascotaEnfermedadDTO;
import com.app.Enums.EstadoEnfermedad;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas-enfermedades")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class MascotaEnfermedadController {
    private final MascotaEnfermedadService service;

    @GetMapping
    public ResponseEntity<List<MascotaEnfermedadDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MascotaEnfermedadDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<MascotaEnfermedadDTO>> findByMascotaId(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(service.findByMascotaId(mascotaId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<MascotaEnfermedadDTO>> findByEstado(@PathVariable EstadoEnfermedad estado) {
        return ResponseEntity.ok(service.findByEstado(estado));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<MascotaEnfermedadDTO>> findByClienteId(@PathVariable Long clienteId) {
        return ResponseEntity.ok(service.findByClienteId(clienteId));
    }

    @GetMapping("/activas")
    public ResponseEntity<List<MascotaEnfermedadDTO>> findEnfermedadesActivas() {
        return ResponseEntity.ok(service.findEnfermedadesActivas());
    }

    @PostMapping
    public ResponseEntity<MascotaEnfermedadDTO> save(@RequestBody MascotaEnfermedadDTO dto) {
        return ResponseEntity.ok(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MascotaEnfermedadDTO> update(@PathVariable Long id, @RequestBody MascotaEnfermedadDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
