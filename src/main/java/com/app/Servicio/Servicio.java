package com.app.Servicio;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "servicio")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;
    private String descripcion;

    @Column(nullable = false)
    private Double precio;
    private boolean activo = true;

    @Column(length = 500)
    private String imagenUrl;
}
