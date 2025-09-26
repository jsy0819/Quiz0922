package com.example.demo.recommendation;

import java.time.LocalDateTime;

import com.example.demo.user.User;
import com.example.demo.product.Product;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 추천 대상 사용자와의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 외래 키 컬럼 이름
    private User user;

    // 추천된 상품과의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_product_id") // 외래 키 컬럼 이름
    private Product recommendedProduct;


    // 추천 점수 (예: 유사도 점수)
    private double score;
    
    // 추천이 생성된 시각
    private LocalDateTime createdAt = LocalDateTime.now();
}