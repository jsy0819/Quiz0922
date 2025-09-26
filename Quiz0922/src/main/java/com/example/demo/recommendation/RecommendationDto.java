package com.example.demo.recommendation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecommendationDto {

    private Long productId;
    private String productName;
    private int productPrice;
    private String productDescription;
    private String productOwner;
    private int emotionLevel;
    private double rarityScore;
    
    // 상품 추천 이유 (추가 정보)
    private String recommendationReason;
}