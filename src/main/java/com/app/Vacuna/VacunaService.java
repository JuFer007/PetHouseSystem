package com.app.Vacuna;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class VacunaService {
    private final VacunaRepository vacunaRepository;

    public List<Vacuna> findAll() {
        return vacunaRepository.findAll();
    }

    public Vacuna findById(Long id) {
        return vacunaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacuna no encontrada"));
    }

    public List<Vacuna> findByNombre(String nombre) {
        return vacunaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Vacuna save(Vacuna vacuna) {
        vacuna.setId(null);
        return vacunaRepository.save(vacuna);
    }

    public Vacuna update(Long id, Vacuna vacuna) {
        Vacuna vacunaExistente = findById(id);
        vacunaExistente.setNombre(vacuna.getNombre());
        vacunaExistente.setDescripcion(vacuna.getDescripcion());
        vacunaExistente.setDosisRequeridas(vacuna.getDosisRequeridas());
        return vacunaRepository.save(vacunaExistente);
    }

    public void deleteById(Long id) {
        vacunaRepository.deleteById(id);
    }
}
