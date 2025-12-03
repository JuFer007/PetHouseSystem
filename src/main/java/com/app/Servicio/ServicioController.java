package com.app.Servicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/servicios")

public class ServicioController {
    private final ServicioService servicioService;

    @GetMapping
    public ResponseEntity<List<Servicio>> getAll() {
        return ResponseEntity.ok(servicioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> getById(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.findById(id));
    }

    @GetMapping("/activo/{estado}")
    public ResponseEntity<List<Servicio>> getByActivo(@PathVariable boolean estado) {
        return ResponseEntity.ok(servicioService.findByActivo(estado));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Servicio>> getByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(servicioService.findByNombre(nombre));
    }

    @PutMapping("/{id}/cambiar-estado")
    public ResponseEntity<Servicio> cambiarEstado(@PathVariable Long id) {
        Servicio servicio = servicioService.findById(id);
        servicio.setActivo(!servicio.isActivo());
        return ResponseEntity.ok(servicioService.update(id, servicio));
    }

    @PostMapping
    public ResponseEntity<Servicio> create(@RequestBody Servicio servicio) {
        return ResponseEntity.ok(servicioService.save(servicio));
    }

    @PostMapping("/con-imagen")
    public ResponseEntity<Servicio> createConImagen(
            @RequestPart("servicio") Servicio servicio,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {

        return ResponseEntity.ok(servicioService.saveConImagen(servicio, imagen));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> update(
            @PathVariable Long id,
            @RequestBody Servicio servicio) {

        return ResponseEntity.ok(servicioService.update(id, servicio));
    }

    @PutMapping("/{id}/con-imagen")
    public ResponseEntity<Servicio> updateConImagen(
            @PathVariable Long id,
            @RequestPart("servicio") Servicio servicio,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {

        return ResponseEntity.ok(servicioService.updateConImagen(id, servicio, imagen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        servicioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
