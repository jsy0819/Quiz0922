package com.example.demo.product;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

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

// 이 애플리케이션의 핵심 데이터 모델로, DB의 'products' 테이블과 매핑됩니다.
// 사용처: ProductRepository를 통해 DB에 저장/조회되며, Service에서 DTO 변환의 원본이 됩니다.
@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "products")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false)
	private String name;
	@Lob
	private String description;
	@Lob
	private String detailedDescription;
	@Column(nullable = false)
	private Integer price;
	@Column(nullable = false)
	private Integer stock;
	
	// Enum 타입인 MemoryType을 DB에 문자열로 저장합니다.
	@Enumerated(EnumType.STRING)
	private MemoryType memoryType;
	
	@Column(nullable = false)
	private String originalOwner;
	private Integer emotionLevel;
	private Integer rarityScore;
	private String magicalPower;
	
	// 상품 생성 시간을 자동으로 기록합니다. 정렬 기준으로 사용됩니다.
	@CreatedDate
	private LocalDateTime createdAt;

}