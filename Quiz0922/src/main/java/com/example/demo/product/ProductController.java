package com.example.demo.product;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// =========================================================================
// View Controller: HTML 템플릿 반환 및 Thymeleaf 데이터 바인딩
// =========================================================================
/**
 * Spring MVC의 View 역할을 담당하며, Thymeleaf 템플릿을 반환합니다.
 */
@Controller
@RequestMapping("/products") // URL 경로: /products
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;
	
	/**
	 * 상품 목록 페이지 (GET /products)
	 * * ⭐ 협업 주석: 초기 로딩 시 서버 측 렌더링을 위해 일부 상품 목록을 Model에 담아 전달합니다.
	 * (JavaScript 로딩 실패 시 대비 및 초기 로딩 속도 향상 목적)
	 * * @param model Thymeleaf로 데이터를 전달하는 모델 객체
	 * @return 'products.html' 템플릿 이름
	 */
	@GetMapping
	public String productList(Model model) {
	    // 초기 상품 로드를 위해 최신 상품 12개를 조회하여 Model에 담습니다.
	    // 이 데이터는 products.html의 Thymeleaf 반복문(th:each)에서 사용됩니다.
	    List<ProductResponse> initialProducts = productService.getTopNByRarity(12); // 예시로 희귀도 높은 순 12개 사용
	    model.addAttribute("products", initialProducts);
	    
	    // 이후의 검색/필터링은 products.js에서 /api/products를 비동기 호출하여 처리됩니다.
	    return "products"; 
	}

	/**
	 * 상품 상세 페이지 (GET /products/{productId})
	 * @param productId 조회할 상품 ID
	 * @param model Thymeleaf로 데이터를 전달하는 모델 객체
	 * @return 'product-detail.html' 템플릿 이름
	 */
	@GetMapping("/{productId}")
	public String productDetail(@PathVariable("productId") Long productId, Model model) {
		// 1. 상품 상세 정보 조회
		ProductResponse productResponse = productService.getProductDetail(productId);
		model.addAttribute("product", productResponse);
		
		// 2. 관련 상품 정보 조회 (추천 로직)
		model.addAttribute("relatedProducts", productService.getRelatedProducts(productId));
		return "product-detail"; 
	}

}

// =========================================================================
// REST Controller: 웹 프론트엔드(JavaScript)의 비동기 JSON API 요청 처리
// =========================================================================
/**
 * JavaScript 클라이언트의 비동기 호출을 처리하는 REST API Endpoint입니다.
 */
@RestController
@RequestMapping("/api") // 모든 API는 /api로 시작하도록 상위 경로를 설정합니다.
@RequiredArgsConstructor
class ProductApiController {

	private final ProductService productService;

	/**
	 * 1. 상품 목록 검색 및 조회 API
	 * - 사용 경로: /api/products
	 * - @ModelAttribute로 DTO 바인딩: ProductSearchRequest의 커스텀 Setter 덕분에 빈 필터 값은 Null로 자동 정제되어 안전합니다.
	 * @param request 검색 조건 DTO (쿼리 파라미터 자동 바인딩)
	 * @return 페이징된 상품 목록 및 정보 (JSON)
	 */
	@GetMapping("/products")
	public ResponseEntity<ProductListResponse> getProducts(@ModelAttribute ProductSearchRequest request) {
		ProductListResponse response = productService.searchProducts(request);
		return ResponseEntity.ok(response);
	}

	/**
	 * 2. 상품 상세 정보 조회 API (JS에서 팝업/모달에 사용 가능)
	 * - 사용 경로: /api/products/{productId}
	 * @param productId 조회할 상품 ID
	 * @return 상품 상세 정보 DTO (JSON)
	 */
	@GetMapping("/products/{productId}")
	public ResponseEntity<ProductResponse> getProductDetail(@PathVariable("productId") Long productId) {
		ProductResponse response = productService.getProductDetail(productId);
		return ResponseEntity.ok(response);
	}
	
	/**
	 * 3. 추천 상품 목록 조회 API (index.html, products.js 사이드바에 사용)
	 * - 사용 경로: /api/recommendations/products
	 * - 희귀도 점수가 높은 순으로 N개의 상품을 조회합니다.
	 * @param size 조회할 상품 개수 (기본값 3)
	 * @return 추천 상품 목록 (JSON)
	 */
	@GetMapping("/recommendations/products")
	public ResponseEntity<List<ProductResponse>> getRecommendations(
			@RequestParam(defaultValue = "3") int size) {
		List<ProductResponse> response = productService.getTopNByRarity(size);
		return ResponseEntity.ok(response);
	}

}