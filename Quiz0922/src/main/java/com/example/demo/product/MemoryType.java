package com.example.demo.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

// =========================================================================
// 상품의 기억 종류를 정의하는 Enum (DB 저장 및 View 표시용)
// =========================================================================
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

	private final String displayName; // 화면 표시 이름 (DTO를 통해 View에 전달됨)
	private final String icon; // DTO를 통해 상품 카드에 표시될 이모지 아이콘
}