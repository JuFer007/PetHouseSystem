package com.app.Horario;
import com.app.DTO.VeterinarioDisponibleDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/veterinarios-disponibles")
@RequiredArgsConstructor

public class VeterinarioDisponibleController {
    private final VeterinarioDisponibleService service;

    @GetMapping
    public ResponseEntity<List<VeterinarioDisponibleDTO>> obtenerDisponibles(
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime hora) {
        return ResponseEntity.ok(service.obtenerVeterinariosDisponibles(fecha, hora));
    }
}
