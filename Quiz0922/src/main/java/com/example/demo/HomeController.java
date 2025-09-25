package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/index")
	public String home() {
		return "index";
	}
	
	@GetMapping("/products")
	public String product() {
		return "products";
	}
	
	@GetMapping("/memory-simulator")
	public String memory() {
		return "memory-simulator";
	}
	
	@GetMapping("/cart")
	public String cart() {
		return "cart";
	}
	
	@GetMapping("/admin/dashboard")
	public String adminLogin() {
		return "admin-dashboard";
	}
	
	@GetMapping("/")
	public String rootPage() {
		return "index";
	}
	
}
