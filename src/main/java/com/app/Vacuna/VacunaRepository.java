package com.app.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface VacunaRepository extends JpaRepository<Vacuna, Long> {
    List<Vacuna> findByNombreContainingIgnoreCase(String nombre);
}
