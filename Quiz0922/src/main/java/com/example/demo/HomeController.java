package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/index")
	public String home() {
		return "index";
	}
	
// [주석 추가 이유]
// 상품 기능 전담 컨트롤러(ProductsController 등)로 역할 분리함.
//	@GetMapping("/products")
//	public String product() {
//		return "products";
//	}
	
	@GetMapping("/memory-simulator")
	public String memory() {
		return "memory-simulator";
	}
	
	@GetMapping("/cart")
	public String cart() {
		return "cart";
	}
	
	@GetMapping("/")
	public String rootPage() {
		return "index";
	}
	
}
