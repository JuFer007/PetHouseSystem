package com.app.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

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
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
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
}
