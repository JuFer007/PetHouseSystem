package com.app.Cita;
import com.app.Servicio.Servicio;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "cita")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate fecha;
    private String motivo;
    private String estado;
    private LocalTime hora;

    @Column(name = "mascota_id")
    private Long mascotaId;

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;
}
