package com.example.demo.product;

import lombok.Builder;
import lombok.Getter;

/**
 * 상품 정보를 간소화하여 전달하는 DTO (주로 상품 목록 노출 및 API 응답 시 사용)
 * Product Entity로부터 MemoryType의 displayName과 icon을 미리 추출하여 Thymeleaf 오류를 방지합니다.
 */
@Getter
@Builder
public class ProductDto {

	private final Long id;
	private final String name;
	private final Integer price;
	private final Integer stock;
	private final String originalOwner;
	private final Integer emotionLevel;
	private final Integer rarityScore;
	
	private final String description;
	
	// ⭐ Thymeleaf 오류 해결을 위해 추가 및 수정된 필드
	// private final String memoryType; // (기존 필드 제거, name과 icon으로 분리)
	private final String memoryTypeName; // MemoryType Enum의 displayName (View에 표시)
	private final String memoryIcon; // MemoryType Enum의 아이콘 값 (View에 표시)
	
	private final String detailedDescription; // (상품 상세 페이지에 필요할 수 있으므로 추가)
	private final String magicalPower; // (상품 상세 페이지에 필요할 수 있으므로 추가)
	
	/**
	 * Product Entity를 ProductDto로 변환하는 팩토리 메서드
	 * @param product 원본 Product Entity
	 * @return 변환된 ProductDto
	 */
	public static ProductDto from(Product product) {
		
		MemoryType memoryType = product.getMemoryType();
		
		// MemoryType Enum의 displayName을 String으로 변환합니다.
		String memoryTypeName = memoryType != null ? memoryType.getDisplayName() : null;
		
		// MemoryType Enum에서 아이콘을 가져오고, 없으면 기본값 "🎁"을 사용합니다.
		String memoryIcon = memoryType != null ? memoryType.getIcon() : "🎁"; 
		
		return ProductDto.builder()
				.id(product.getId())
				.name(product.getName())
				.price(product.getPrice())
				.stock(product.getStock())
				.originalOwner(product.getOriginalOwner()) 
				.emotionLevel(product.getEmotionLevel())
				.rarityScore(product.getRarityScore())
				
				// ⭐ 새로운 필드 사용
				.memoryTypeName(memoryTypeName) 
				.memoryIcon(memoryIcon)
				
				.description(product.getDescription())
				.detailedDescription(product.getDetailedDescription())
				.magicalPower(product.getMagicalPower())
				.build();
	}
	
}