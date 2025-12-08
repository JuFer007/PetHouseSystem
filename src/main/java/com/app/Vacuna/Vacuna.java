package com.app.Vacuna;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vacuna")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Vacuna {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer dosisRequeridas;
    private Integer intervaloDias;
}
