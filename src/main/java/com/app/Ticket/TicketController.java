package com.app.Ticket;
import com.app.DTO.TicketDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor

public class TicketController {
    private final TicketService pagoTicketService;

    @GetMapping("/{citaId}")
    public ResponseEntity<TicketDTO> obtenerTicket(@PathVariable Long citaId) {
        try {
            TicketDTO ticket = pagoTicketService.generarPagoTicket(citaId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
