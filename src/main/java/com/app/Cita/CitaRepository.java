package com.app.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByMascotaId(Long mascotaId);
    List<Cita> findByEstado(String estado);
    List<Cita> findByFechaBetween(LocalDate inicio, LocalDate fin);
}
