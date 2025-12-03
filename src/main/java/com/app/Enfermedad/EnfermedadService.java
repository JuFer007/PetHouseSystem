package com.app.Enfermedad;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class EnfermedadService {
    private final EnfermedadRepository enfermedadRepository;

    public List<Enfermedad> findAll() {
        return enfermedadRepository.findAll();
    }

    public Enfermedad findById(Long id) {
        return enfermedadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enfermedad no encontrada"));
    }

    public List<Enfermedad> findByNombre(String nombre) {
        return enfermedadRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Enfermedad save(Enfermedad enfermedad) {
        return enfermedadRepository.save(enfermedad);
    }

    public Enfermedad update(Long id, Enfermedad enfermedad) {
        Enfermedad enfermedadExistente = findById(id);
        enfermedadExistente.setNombre(enfermedad.getNombre());
        enfermedadExistente.setDescripcion(enfermedad.getDescripcion());
        enfermedadExistente.setTratamiento(enfermedad.getTratamiento());
        enfermedadExistente.setPrevencion(enfermedad.getPrevencion());
        return enfermedadRepository.save(enfermedadExistente);
    }

    public void deleteById(Long id) {
        enfermedadRepository.deleteById(id);
    }
}
