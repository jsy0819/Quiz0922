package com.example.demo.product;

import lombok.Builder;
import lombok.Getter;

/**
 * 상품 정보를 담아 View나 API 응답으로 전달하는 DTO (상세 및 목록 모두 사용)
 * Product Entity로부터 MemoryType의 displayName과 icon을 미리 추출하여 Thymeleaf 오류를 방지합니다.
 */
@Getter
@Builder
public class ProductResponse {

	private final Long id;
	private final String name;
	private final Integer price;
	private final Integer stock;
	private final String originalOwner;
	private final Integer emotionLevel;
	private final Integer rarityScore;
	
	private final String description;
	private final String detailedDescription; // 상세 설명 (Product.detailedDescription)
	
	// ⭐ Thymeleaf 오류 해결을 위해 String으로 미리 변환하여 저장
	private final String memoryTypeName; // MemoryType Enum의 displayName
	private final String memoryIcon;     // MemoryType Enum의 icon
	
	// List<String> imageUrls; // 이미지 URL 목록 (주석 처리됨)
	private final String magicalPower;

	/**
	 * Product Entity를 ProductResponse로 변환하는 팩토리 메서드
	 * @param product 원본 Product Entity
	 * @return 변환된 ProductResponse
	 */
	public static ProductResponse of(Product product) {
		
		MemoryType memoryType = product.getMemoryType();
		
		// 널 체크 및 String 변환 처리
		String memoryTypeName = memoryType != null ? memoryType.getDisplayName() : null;
		String memoryIcon = memoryType != null ? memoryType.getIcon() : "🎁"; // 기본 아이콘 설정

		return ProductResponse.builder()
				.id(product.getId())
				.name(product.getName())
				.price(product.getPrice())
				.stock(product.getStock())
				.originalOwner(product.getOriginalOwner()) 
				.emotionLevel(product.getEmotionLevel())
				.rarityScore(product.getRarityScore())
				
				// ⭐ Thymeleaf 오류 해결을 위한 필드 설정
				.memoryTypeName(memoryTypeName) 
				.memoryIcon(memoryIcon) 
				
				.description(product.getDescription())
				.detailedDescription(product.getDetailedDescription())
				.magicalPower(product.getMagicalPower())
				.build();
	}
}