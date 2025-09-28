package com.example.demo.product;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// =========================================================================
// 핵심 데이터 모델: Product Entity
// =========================================================================
/**
 * 이 애플리케이션의 핵심 데이터 모델로, DB의 'products' 테이블과 매핑됩니다.
 * 사용처: ProductRepository를 통해 DB에 저장/조회되며, Service에서 DTO 변환의 원본이 됩니다.
 */
@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 사용을 위한 기본 생성자 (외부 접근 방지)
@AllArgsConstructor(access = AccessLevel.PROTECTED) // Builder 사용 시 내부적으로 호출되는 전체 생성자
@Table(name = "products")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false)
	private String name;
	@Lob
	private String description; // 상품 목록에 표시되는 간략 설명 (products.js에서 사용)
	@Lob
	private String detailedDescription; // 상품 상세 페이지에 표시되는 긴 설명
	@Column(nullable = false)
	private Integer price;
	@Column(nullable = false)
	private Integer stock;
	
	// Enum 타입인 MemoryType을 DB에 문자열(Enum Name)로 저장합니다.
	@Enumerated(EnumType.STRING)
	private MemoryType memoryType;
	
	@Column(nullable = false)
	private String originalOwner; // OwnerType Enum의 displayName을 String으로 저장합니다. (필터링 기준)
	private Integer emotionLevel; // 감정 강도 (1~10)
	private Integer rarityScore; // 희귀도 점수 (1~10)
	private String magicalPower; // 상품이 가진 특별한 힘 (옵션)
	
	// 상품 생성 시간을 기록합니다. (정렬 기준으로 사용)
	private LocalDateTime createdAt;

}