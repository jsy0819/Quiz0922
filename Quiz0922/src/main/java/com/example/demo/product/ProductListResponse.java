package com.example.demo.product;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

// =========================================================================
// 상품 목록 조회 API의 최종 응답 객체 (페이징 정보 포함)
// =========================================================================
/**
 * 사용처: ProductService.searchProducts에서 생성되어 ProductApiController.getProducts를 통해 
 * JavaScript 클라이언트에게 JSON으로 반환됩니다.
 */
@Getter
@Builder
public class ProductListResponse {

	private final List<ProductResponse> products; // 실제 상품 DTO 리스트
	private final Long totalCount; // 전체 검색 결과 개수 (페이징 총 개수)
	private final Integer currentPage; // 현재 페이지 번호 (프론트엔드 호환을 위해 1부터 시작하도록 설정)
	private final Integer totalPages; // 전체 페이지 수

}