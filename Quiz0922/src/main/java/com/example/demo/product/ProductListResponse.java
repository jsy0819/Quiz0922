package com.example.demo.product;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

// 상품 목록 조회 API의 최종 응답 객체
// 사용처: ProductService.searchProducts에서 생성되어 ProductApiController.getProducts를 통해 JSON으로 반환.
@Getter
@Builder
public class ProductListResponse {

	private final List<ProductResponse> products; // 실제 상품 DTO 리스트
	private final Long totalCount; // 전체 상품 개수
	private final Integer currentPage; // 현재 페이지 번호
	private final Integer totalPages; // 전체 페이지 수

}