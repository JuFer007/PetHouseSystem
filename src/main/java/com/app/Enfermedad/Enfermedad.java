package com.app.Enfermedad;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enfermedad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Enfermedad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String descripcion;
    private String tratamiento;
    private String prevencion;
}
