package com.example.demo.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 상품 검색 및 필터링 요청 정보를 담는 DTO
// 사용처: ProductApiController에서 @ModelAttribute로 클라이언트의 쿼리 파라미터를 수신하고, ProductService의 searchProducts 메서드에 입력됩니다.
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductSearchRequest {

	// 클라이언트에서 값을 넘기지 않을 경우 사용될 기본값들
	private Integer page = 1;
	private Integer size = 12;
	private String sort = "newest";
	private String category;
	private String priceRange;
	private String owner;
	private Integer emotionLevelMin; // 감정 강도 최소값
	private String search; // 검색어
}