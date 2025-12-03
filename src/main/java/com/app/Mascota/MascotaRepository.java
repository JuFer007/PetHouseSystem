package com.app.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByClienteId(Long clienteId);
    List<Mascota> findByEspecie(String especie);
    Optional<Mascota> findByNombreAndClienteId(String nombre, Long clienteId);
    List<Mascota> findByNombreContainingIgnoreCase(String nombre);
}
