package com.example.demo.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 상품의 기억 종류를 정의하는 Enum
// 사용처: Product Entity의 필드 타입으로 사용되며, DTO 변환 시 displayName과 icon을 제공합니다.
@Getter
@AllArgsConstructor
public enum MemoryType {

	CHILDHOOD("어린시절", "🧸"),
	FRIENDSHIP("우정", "👫"),
	LOVE("사랑", "💕"),
	ADVENTURE("모험", "🗺️"),
	FOOD("음식", "🍰"),
	TOY("장난감", "🎮"),
	EXPERIMENT("실험", "🧪");

	private final String displayName; // 화면 표시 이름
	private final String icon; // 표시용 이모지 아이콘

}