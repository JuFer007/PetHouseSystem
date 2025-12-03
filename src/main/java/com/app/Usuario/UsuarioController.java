package com.app.Usuario;
import com.app.DTO.UsuarioDTO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor

public class UsuarioController {
    private final UsuarioService usuarioService;

    @PostMapping("/inicioSesion")
    public ResponseEntity<?> login(@RequestBody UsuarioDTO loginRequest, HttpSession session) {
        try {
            Usuario usuario = usuarioService.findByCorreoElectronico(loginRequest.getCorreoElectronico());

            if (!usuarioService.verificarPassword(loginRequest.getPassword(), usuario.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Contraseña incorrecta"));
            }

            if (!usuario.isActivo()) {
                return ResponseEntity.status(403).body(Map.of("message", "Usuario desactivado"));
            }

            session.setAttribute("usuario", usuario);
            session.setAttribute("usuarioId", usuario.getId());
            session.setAttribute("rol", usuario.getRol());

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

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.findAll());
    }

    @GetMapping("/detalle/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        Usuario savedUsuario = usuarioService.save(usuario);
        return ResponseEntity.ok(savedUsuario);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.update(id, usuario));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        usuarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/activar/{id}")
    public ResponseEntity<Usuario> activarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.activar(id));
    }

    @PutMapping("/desactivar/{id}")
    public ResponseEntity<Usuario> desactivarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.desactivar(id));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Sesión cerrada exitosamente"));
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");

        if (usuario == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No hay sesión activa"));
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
        return ResponseEntity.ok(response);
    }
}
