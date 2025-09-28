package com.example.demo.product;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * =========================================================================
 * 상품 검색 요청 DTO (Data Transfer Object)
 * =========================================================================
 * Spring의 @ModelAttribute를 통해 products.html의 폼/쿼리 파라미터가 자동으로 바인딩됩니다.
 * <p>
 * **핵심 방어 로직:** Custom Setter를 통해 프론트엔드에서 넘어오는 빈 문자열 ("")이나 공백을 
 * DB 검색 조건(JPA Specification) 생성을 위해 **Null**로 자동 변환하여 안정성을 확보합니다.
 */
@Getter
@Setter
@NoArgsConstructor // Spring Data Binding 및 Jackson Deserialization을 위한 기본 생성자
@AllArgsConstructor 
public class ProductSearchRequest {

	// =========================== 검색 및 페이징 기본 설정 필드 ===========================
	private Integer page = 0; 		      // 현재 페이지 (DB/JPA 기준 0부터 시작)
	private Integer size = 12; 		      // 페이지당 항목 수 (products.js의 loadMoreProducts에서 사용)
	private String sort = "newest"; 		  // 정렬 기준 (products.html의 sortFilter ID 값과 매칭)
	private Integer emotionLevelMin = 5; // 최소 감정 강도 (products.html의 emotionFilter value)
	
	// =========================== 필터링 필드 (products.html의 <select> ID와 매칭) ===========================
	private String category; 	      // 기억 종류 (HTML: memoryTypeFilter ID / MemoryType Enum Name과 매칭)
	private String priceRange; 	      // 가격 범위 (HTML: priceFilter ID / PriceRange Enum displayName과 매칭)
	private String owner; 		      // 기억 주인 (HTML: ownerFilter ID / OwnerType displayName과 매칭)
	private String search; 		      // 검색 키워드 (HTML: searchInput ID)
    
	// =========================== Custom Setter를 통한 필터 정제 ===========================
    
    /** category 필드의 Setter 재정의: 빈 문자열("") 또는 공백을 null로 변환 */
    public void setCategory(String category) {
        this.category = sanitizeString(category);
    }
    
    /** priceRange 필드의 Setter 재정의: 빈 문자열("") 또는 공백을 null로 변환 */
    public void setPriceRange(String priceRange) {
        this.priceRange = sanitizeString(priceRange);
    }
    
    /** owner 필드의 Setter 재정의: 빈 문자열("") 또는 공백을 null로 변환 */
    // Service 계층의 Specification 로직에서 null 체크를 통해 해당 조건이 스킵되도록 합니다.
    public void setOwner(String owner) {
        this.owner = sanitizeString(owner);
    }
    
    /** search 필드의 Setter 재정의: 빈 문자열("") 또는 공백을 null로 변환 */
    public void setSearch(String search) {
        this.search = sanitizeString(search);
    }
    
    /** 내부 유틸리티: 문자열을 정제하여 빈 값이거나 공백만 있는 경우 null 반환 */
    private String sanitizeString(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}