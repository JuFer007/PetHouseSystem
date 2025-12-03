package com.app.Config;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class SessionFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String uri = httpRequest.getRequestURI();

        if (uri.equals("/dashboard.html")) {
            HttpSession session = httpRequest.getSession(false);
            if (session == null || session.getAttribute("usuario") == null) {
                httpResponse.sendRedirect("/login.html");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
