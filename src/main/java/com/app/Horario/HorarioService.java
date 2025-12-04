package com.app.Horario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("mysqlTransactionManager")

public class HorarioService {
    private final HorarioRepository horarioRepository;

    public List<Horario> findByTrabajadorId(Long trabajadorId) {
        return horarioRepository.findByTrabajadorId(trabajadorId);
    }

    public Horario save(Horario horario) {
        return horarioRepository.save(horario);
    }

    public void deleteById(Long id) {
        horarioRepository.deleteById(id);
    }
}
