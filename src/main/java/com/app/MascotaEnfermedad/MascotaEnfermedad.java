package com.app.MascotaEnfermedad;
import com.app.Enfermedad.Enfermedad;
import com.app.Enums.EstadoEnfermedad;
import com.app.Mascota.Mascota;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "mascota_enfermedad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class MascotaEnfermedad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    @ManyToOne
    @JoinColumn(name = "enfermedad_id", nullable = false)
    private Enfermedad enfermedad;

    @Column(name = "fecha_diagnostico")
    private LocalDate fechaDiagnostico;

    private String sintomas;         // Síntomas específicos de esta mascota
    private String observaciones;    // Notas del veterinario

    @Enumerated(EnumType.STRING)
    private EstadoEnfermedad estado; // EN_TRATAMIENTO, RECUPERADO, CRONICO

    @Column(name = "fecha_recuperacion")
    private LocalDate fechaRecuperacion;
}
