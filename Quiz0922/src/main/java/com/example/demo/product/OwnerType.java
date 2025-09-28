package com.example.demo.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

// =========================================================================
// 상품(기억)의 원래 주인(Original Owner)을 정의하는 Enum
// =========================================================================
/**
 * 사용처: 상품 필터링 로직에서 원본 소유자 이름(displayName)을 검증하거나, 
 * DTO/View에서 상품 정보 표시 시 displayName과 icon을 제공합니다.
 * <p>
 * (현재 Product Entity에서는 String으로 originalOwner 필드를 관리합니다.)
 */
@Getter
@AllArgsConstructor
public enum OwnerType {

	// Enum Name (DB에서 사용하거나 내부 식별자로 사용)
	TOSIM("토심이", "🐰"),
	WAFFLEBEAR("와플곰", "🐻"),
	TANGO("탱고", "🐱"),
	NURYEONG("누렁이", "🐶"),
	BAPUGAE("바쁘개", "🐕‍🦺"),
	GUPHANYANG("급하냥", "😼");

	private final String displayName; // 화면 표시 이름 (ProductSearchRequest의 owner 필드와 매칭)
	private final String icon; // 표시용 이모지 아이콘

}