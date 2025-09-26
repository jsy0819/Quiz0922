package com.example.demo.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 상품(기억)의 원래 주인(Original Owner)을 정의하는 Enum
// 사용처: 
// 1. Product Entity: originalOwner 필드와 연결되거나, 필터링 로직에서 원본 소유자 이름(displayName)을 검증하는 데 사용될 수 있습니다. 
// 2. 상품 필터링: ProductSearchRequest를 받아 Service에서 Owner 필터를 구현할 때 사용.
// 3. DTO/View: 상품 정보 표시 시 displayName과 icon을 제공합니다.
@Getter
@AllArgsConstructor
public enum OwnerType {

	TOSIM("토심이", "🐰"),
	WAFFLEBEAR("와플곰", "🐻"),
	TANGO("탱고", "🐱"),
	NURYEONG("누렁이", "🐶"),
	BAPUGAE("바쁘개", "🐕‍🦺"),
	GUPHANYANG("급하냥", "😼");

	private final String displayName; // 화면 표시 이름 (예: 필터 드롭다운 목록)
	private final String icon; // 표시용 이모지 아이콘

}