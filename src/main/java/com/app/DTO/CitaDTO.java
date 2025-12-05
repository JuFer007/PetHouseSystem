package com.app.DTO;
import com.app.Cliente.Cliente;
import com.app.Mascota.Mascota;
import lombok.Data;
@Data
public class CitaDTO {
    private Cliente cliente;
    private Mascota mascota;
    private CitaDetalleDTO cita;

}
