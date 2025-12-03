package com.app.Config;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller

public class HomeController {
    @RequestMapping("/")
    public String returnHome() {
        return "index";
    }

    @RequestMapping("/login")
    public String returnLogin() {
        return "login";
    }

    @RequestMapping("/dashboard")
    public String returnDashboard() {
        return "dashboard";
    }
}
