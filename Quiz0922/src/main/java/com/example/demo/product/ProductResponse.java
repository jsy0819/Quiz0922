package com.example.demo.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

// 상품 상세 정보 및 목록의 기본 응답 DTO
// 사용처: ProductService에서 Entity를 이 형태로 변환하며, Controller/API 응답의 주요 데이터 모델로 사용.
@Getter
@Builder
@AllArgsConstructor
public class ProductResponse {

	// MemoryType 정보를 묶어서 전달하는 내부 DTO
	@Getter
	@Builder
	@AllArgsConstructor
	public static class MemoryTypeDTO {

		private final String displayName;
		private final String icon;

	}
	
	// 중첩 DTO를 사용하여 memoryType 정보를 구조화하여 전달합니다.
	private final MemoryTypeDTO memoryType;

	private final Long id;
	private final String name;
	private final String description;
	private final Integer price;
	private final Integer stock;
	private final Integer rarityScore;
	private final String originalOwner;
	private final Integer emotionLevel;
	private final String detailedDescription;
	private final String magicalPower;

	// Product Entity를 ProductResponse DTO로 변환하는 팩토리 메서드
	public static ProductResponse of(Product product) {
			MemoryTypeDTO memoryTypeDTO = MemoryTypeDTO.builder()
							.displayName(product.getMemoryType().getDisplayName())
							.icon(product.getMemoryType().getIcon())
							.build();

			return ProductResponse.builder()
							.id(product.getId())
							.name(product.getName())
							.description(product.getDescription())
							.price(product.getPrice())
							.stock(product.getStock())
							.rarityScore(product.getRarityScore())
							.originalOwner(product.getOriginalOwner())
							.emotionLevel(product.getEmotionLevel())
							.detailedDescription(product.getDetailedDescription())
							.magicalPower(product.getMagicalPower())
							.memoryType(memoryTypeDTO)
							.build();
	}

}