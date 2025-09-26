package com.example.demo.product;

import java.util.Arrays;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 상품 검색 시 사용되는 가격 범위 필터 Enum
// 사용처: ProductService에서 사용자의 'priceRange' 요청 문자열을 실제 min/max 가격 범위로 매핑하여 DB 쿼리 조건을 생성할 때 사용.
@Getter
@AllArgsConstructor
public enum PriceRange {

	ALL("전체", 0, Integer.MAX_VALUE),
	UNDER_10K("1만원 미만", 0, 10000),
	_10K_TO_50K("1만원 - 5만원", 10000, 50000),
	_50K_TO_100K("5만원 - 10만원", 50000, 100000),
	OVER_100K("10만원 이상", 100000, Integer.MAX_VALUE);

	private final String displayName;
	private final Integer minPrice;
	private final Integer maxPrice;

	// 표시 이름(displayName)을 기준으로 해당 Enum 상수를 찾는 유틸리티 메서드
	public static Optional<PriceRange> findByDisplayName(String displayName) {
		return Arrays.stream(PriceRange.values())
				.filter(range -> range.getDisplayName().equals(displayName))
				.findFirst();
	}

}