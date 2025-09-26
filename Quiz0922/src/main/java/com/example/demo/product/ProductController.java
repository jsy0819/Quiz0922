package com.example.demo.product;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// 브라우저의 HTML View 요청을 처리하고, Thymeleaf 템플릿을 반환합니다.
@Controller
@RequestMapping("/products.html")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;

	// 상품 목록 페이지 (http://localhost:8080/products.html)
	@GetMapping
	public String products() {
		return "products"; // 'products.html' 템플릿 반환
	}

	// 상품 상세 페이지 (http://localhost:8080/products.html/123)
	@GetMapping("/{productId}")
	public String productDetail(@PathVariable("productId") Long productId, Model model) {
		// 1. 상품 상세 정보 조회
		ProductResponse productResponse = productService.getProductDetail(productId);
		model.addAttribute("product", productResponse);
		
		// 2. 관련 상품 정보 조회 (추천 로직)
		model.addAttribute("relatedProducts", productService.getRelatedProducts(productId));
		return "product-detail"; // 'product-detail.html' 템플릿 반환
	}

}

// 웹 프론트엔드(JavaScript)의 비동기 JSON API 요청을 처리합니다.
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
class ProductApiController {

	private final ProductService productService;

	// 상품 목록 검색 및 조회 (필터링, 페이징 포함)
	// 사용처: 프론트엔드(products.js)에서 상품 목록을 동적으로 불러올 때 사용됩니다.
	@GetMapping
	public ResponseEntity<ProductListResponse> getProducts(@ModelAttribute ProductSearchRequest request) {
		ProductListResponse response = productService.searchProducts(request); 
		return ResponseEntity.ok(response);
	}

	// 상품 상세 정보 조회 API
	// 사용처: 프론트엔드에서 특정 상품의 상세 정보를 비동기적으로 조회할 때 사용됩니다.
	@GetMapping("/{productId}")
	public ResponseEntity<ProductResponse> getProductDetail(@PathVariable("id") Long productId) {
		ProductResponse response = productService.getProductDetail(productId);
		return ResponseEntity.ok(response);
	}

}