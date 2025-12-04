package com.app.Usuario;
import com.app.Cliente.Cliente;
import com.app.Enums.RolUsuario;
import com.app.Trabajador.Trabajador;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String correoElectronico;
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;
    private boolean activo = true;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "trabajador_id", referencedColumnName = "id")
    @JsonIgnoreProperties("usuario")
    private Trabajador trabajador;

    @OneToOne
    @JoinColumn(name = "cliente_id", referencedColumnName = "id")
    private Cliente cliente;
}
