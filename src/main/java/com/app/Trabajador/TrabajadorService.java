package com.app.Trabajador;
import com.app.Enums.CargoTrabajador;
import com.app.Usuario.Usuario;
import com.app.Usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class TrabajadorService {
    private final TrabajadorRepository trabajadorRepository;
    private final UsuarioService usuarioService;

    public List<Trabajador> findAll() {
        return trabajadorRepository.findAll();
    }

    public Trabajador findById(Long id) {
        return trabajadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado"));
    }

    public List<Trabajador> findByActivo(boolean activo) {
        return trabajadorRepository.findByActivo(activo);
    }

    public List<Trabajador> findByCargo(CargoTrabajador cargo) {
        return trabajadorRepository.findByCargo(CargoTrabajador.valueOf(String.valueOf(cargo)));
    }

    public List<Trabajador> findByNombreOApellido(String texto) {
        return trabajadorRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(texto, texto);
    }

    public Trabajador save(Trabajador trabajador) {
        if (trabajador.getUsuario() != null) {
            trabajador.getUsuario().setTrabajador(trabajador);
        }
        return trabajadorRepository.save(trabajador);
    }

    public Trabajador update(Long id, Trabajador trabajador) {
        Trabajador trabajadorExistente = findById(id);

        trabajadorExistente.setNombre(trabajador.getNombre());
        trabajadorExistente.setApellido(trabajador.getApellido());
        trabajadorExistente.setCargo(trabajador.getCargo());
        trabajadorExistente.setSalario(trabajador.getSalario());
        trabajadorExistente.setActivo(trabajador.isActivo());
        trabajadorExistente.setTelefono(trabajador.getTelefono());

        if (trabajador.getUsuario() != null) {
            Usuario usuarioExistente = trabajadorExistente.getUsuario();
            if (usuarioExistente == null) {
                usuarioExistente = new Usuario();
                usuarioExistente.setTrabajador(trabajadorExistente);
                trabajadorExistente.setUsuario(usuarioExistente);
            }

            usuarioExistente.setCorreoElectronico(trabajador.getUsuario().getCorreoElectronico());
            usuarioExistente.setActivo(trabajador.getUsuario().isActivo());
            usuarioExistente.setPassword(trabajador.getUsuario().getPassword());
        }
        return trabajadorRepository.save(trabajadorExistente);
    }

    public void deleteById(Long id) {
        Trabajador trabajador = findById(id);

        if (trabajador.getUsuario() != null) {
            usuarioService.deleteById(trabajador.getUsuario().getId());
            trabajador.setUsuario(null);
        }

        trabajadorRepository.delete(trabajador);
    }

    public Trabajador desactivar(Long id) {
        Trabajador trabajador = findById(id);
        trabajador.setActivo(false);
        return trabajadorRepository.save(trabajador);
    }

    public Trabajador activar(Long id) {
        Trabajador trabajador = findById(id);
        trabajador.setActivo(true);
        return trabajadorRepository.save(trabajador);
    }
}
