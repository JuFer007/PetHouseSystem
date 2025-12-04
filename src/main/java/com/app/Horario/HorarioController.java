package com.app.Horario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor

public class HorarioController {
    private final HorarioService horarioService;

    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<Horario>> findByTrabajador(@PathVariable Long trabajadorId) {
        return ResponseEntity.ok(horarioService.findByTrabajadorId(trabajadorId));
    }

    @PostMapping
    public ResponseEntity<Horario> save(@RequestBody Horario horario) {
        return ResponseEntity.ok(horarioService.save(horario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Horario> update(@PathVariable Long id, @RequestBody Horario horario) {
        horario.setId(id);
        return ResponseEntity.ok(horarioService.save(horario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        horarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
