package com.app.Usuario;
import com.app.DTO.UsuarioDTO;
import com.app.Enums.RolUsuario;
import com.app.Horario.Horario;
import com.app.Horario.HorarioRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario findById(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario findByCorreoElectronico(String correoElectronico) {
        return usuarioRepository.findByCorreoElectronico(correoElectronico)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario save(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario update(Long id, Usuario usuario) {
        Usuario existente = findById(id);
        existente.setCorreoElectronico(usuario.getCorreoElectronico());

        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        existente.setRol(usuario.getRol());
        existente.setActivo(usuario.isActivo());
        existente.setTrabajador(usuario.getTrabajador());
        return usuarioRepository.save(existente);
    }

    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario activar(Long id) {
        Usuario usuario = findById(id);
        usuario.setActivo(true);
        return usuarioRepository.save(usuario);
    }

    public Usuario desactivar(Long id) {
        Usuario usuario = findById(id);
        usuario.setActivo(false);
        return usuarioRepository.save(usuario);
    }

    public boolean verificarPassword(String passwordRaw, String passwordEncriptado) {
        return passwordEncoder.matches(passwordRaw, passwordEncriptado);
    }

    public Map<String, Object> login(UsuarioDTO loginRequest, HttpSession session, HorarioRepository horarioRepository) {

        Usuario usuario = usuarioRepository.findByCorreoElectronico(loginRequest.getCorreoElectronico()).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!verificarPassword(loginRequest.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("PASSWORD_INVALID");
        }

        if (!usuario.isActivo()) {
            throw new RuntimeException("USUARIO_INACTIVO");
        }

        if (usuario.getRol() == RolUsuario.VETERINARIO) {

            LocalTime horaActual = LocalTime.now();
            DayOfWeek diaActual = LocalDate.now().getDayOfWeek();

            List<Horario> horarios = horarioRepository.findByTrabajadorYHorario(usuario.getTrabajador().getId(), diaActual, horaActual);

            if (horarios.isEmpty()) {
                throw new RuntimeException("FUERA_DE_HORARIO");
            }
        }

        session.setAttribute("usuario", usuario);
        session.setAttribute("usuarioId", usuario.getId());
        session.setAttribute("rol", usuario.getRol());

        if (usuario.getTrabajador() != null) {
            session.setAttribute("idTrabajador",
                    usuario.getTrabajador().getId());
        }

        if (usuario.getCliente() != null) {
            session.setAttribute("idCliente",
                    usuario.getCliente().getId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", usuario.getId());
        response.put("correoElectronico", usuario.getCorreoElectronico());
        response.put("rol", usuario.getRol());
        response.put("activo", usuario.isActivo());

        if (usuario.getTrabajador() != null) {
            Map<String, Object> trabajadorData = new HashMap<>();
            trabajadorData.put("id", usuario.getTrabajador().getId());
            trabajadorData.put("nombre", usuario.getTrabajador().getNombre());
            trabajadorData.put("apellido", usuario.getTrabajador().getApellido());
            trabajadorData.put("cargo", usuario.getTrabajador().getCargo());
            response.put("trabajador", trabajadorData);
        }

        if (usuario.getCliente() != null) {
            Map<String, Object> clienteData = new HashMap<>();
            clienteData.put("id", usuario.getCliente().getId());
            clienteData.put("dni", usuario.getCliente().getDni());
            clienteData.put("nombre", usuario.getCliente().getNombre());
            clienteData.put("apellido", usuario.getCliente().getApellido());
            clienteData.put("telefono", usuario.getCliente().getTelefono());
            response.put("cliente", clienteData);
        }
        return response;
    }

    public Map<String, Object> obtenerSesion(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            throw new RuntimeException("No hay sesión activa");
        }
        Map<String, Object> response = new HashMap<>();
        response.put("id", usuario.getId());
        response.put("correoElectronico", usuario.getCorreoElectronico());
        response.put("rol", usuario.getRol());
        response.put("activo", usuario.isActivo());

        if (usuario.getTrabajador() != null) {
            Map<String, Object> trabajadorData = new HashMap<>();
            trabajadorData.put("id", usuario.getTrabajador().getId());
            trabajadorData.put("nombre", usuario.getTrabajador().getNombre());
            trabajadorData.put("apellido", usuario.getTrabajador().getApellido());
            trabajadorData.put("cargo", usuario.getTrabajador().getCargo());
            trabajadorData.put("telefono", usuario.getTrabajador().getTelefono());
            response.put("trabajador", trabajadorData);
        }

        if (usuario.getCliente() != null) {
            Map<String, Object> clienteData = new HashMap<>();
            clienteData.put("id", usuario.getCliente().getId());
            clienteData.put("dni", usuario.getCliente().getDni());
            clienteData.put("nombre", usuario.getCliente().getNombre());
            clienteData.put("apellido", usuario.getCliente().getApellido());
            clienteData.put("telefono", usuario.getCliente().getTelefono());
            response.put("cliente", clienteData);
        }
        return response;
    }
}
