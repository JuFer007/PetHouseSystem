package com.app.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    List<Trabajador> findByActivo(boolean activo);
    List<Trabajador> findByCargo(String cargo);
    List<Trabajador> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);
}
