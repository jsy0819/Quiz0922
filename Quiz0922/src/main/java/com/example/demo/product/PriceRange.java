package com.example.demo.product;

import java.util.Arrays;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Getter;

// =========================================================================
// 상품 검색 시 사용되는 가격 범위 필터 Enum
// =========================================================================
/**
 * 사용처: ProductService에서 사용자의 'priceRange' 요청 문자열(displayName)을 
 * 실제 min/max 가격 범위로 매핑하여 DB 쿼리 조건(JPA Specification)을 생성할 때 사용됩니다.
 */
@Getter
@AllArgsConstructor
public enum PriceRange {

	ALL("전체", 0, Integer.MAX_VALUE),
	UNDER_10K("1만원 미만", 0, 10000),
	_10K_TO_50K("1만원 - 5만원", 10000, 50000),
	_50K_TO_100K("5만원 - 10만원", 50000, 100000),
	OVER_100K("10만원 이상", 100000, Integer.MAX_VALUE);

	private final String displayName; // 화면 표시 이름 (ProductSearchRequest의 priceRange와 매칭)
	private final Integer minPrice; // DB 검색 조건의 최소 가격
	private final Integer maxPrice; // DB 검색 조건의 최대 가격

	/**
	 * 표시 이름(displayName)을 기준으로 해당 Enum 상수를 찾습니다.
	 * @param displayName 프론트엔드에서 넘어온 가격 범위 문자열
	 * @return 해당 PriceRange Enum (Optional)
	 */
	public static Optional<PriceRange> findByDisplayName(String displayName) {
		return Arrays.stream(PriceRange.values())
				.filter(range -> range.getDisplayName().equals(displayName))
				.findFirst();
	}

}