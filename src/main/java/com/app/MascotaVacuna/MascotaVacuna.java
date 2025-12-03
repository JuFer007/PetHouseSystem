package com.app.MascotaVacuna;
import com.app.Enums.EstadoVacuna;
import com.app.Mascota.Mascota;
import com.app.Vacuna.Vacuna;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "mascota_vacuna")
@Getter @Setter @AllArgsConstructor
@NoArgsConstructor
@Builder

public class MascotaVacuna {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    @ManyToOne
    @JoinColumn(name = "vacuna_id", nullable = false)
    private Vacuna vacuna;

    @Column(name = "fecha_aplicacion")
    private LocalDate fechaAplicacion;

    @Column(name = "proxima_dosis")
    private LocalDate proximaDosis;

    private Integer numeroDosiS;

    @Enumerated(EnumType.STRING)
    private EstadoVacuna estado;
    private String observaciones;
}
