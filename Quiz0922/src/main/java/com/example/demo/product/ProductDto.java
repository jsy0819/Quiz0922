package com.example.demo.product;

import lombok.Builder;
import lombok.Getter;

// 상품 정보를 간소화하여 전달하는 DTO (주로 추천 상품 등 간략 정보 노출 시 사용)
// 사용처: ProductService.getRelatedProducts 등의 메서드에서 Product Entity를 이 형태로 변환하여 사용.
@Getter
@Builder
public class ProductDto {

	private final String name;
	private final Integer price;
	private final String memoryIcon;
	private final String originalOwner;
	private final Integer rarityScore;

	// Product Entity를 ProductDto로 변환하는 팩토리 메서드
	public static ProductDto from(Product product) {
		return ProductDto.builder()
				.name(product.getName())
				.price(product.getPrice())
				.memoryIcon(product.getMemoryType().getIcon()) // MemoryType Enum에서 아이콘을 가져옴.
				.originalOwner(product.getOriginalOwner())
				.rarityScore(product.getRarityScore())
				.build();
	}

}