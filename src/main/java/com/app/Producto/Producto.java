package com.app.Producto;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String categoria;
    private Double precio;
    private Integer stock;
    private boolean activo = true;
    private String urlImagen;
}
