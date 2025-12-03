package com.app.Trabajador;
import com.app.Usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trabajador")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Trabajador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String apellido;
    private String cargo;
    private Double salario;
    private String telefono;
    private boolean activo = true;

    @OneToOne(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("trabajador")
    private Usuario usuario;
}
