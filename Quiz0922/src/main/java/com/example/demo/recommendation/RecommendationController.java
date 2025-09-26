package com.example.demo.recommendation;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.product.ProductDto;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // 특정 상품과 유사한 기억 물품 목록을 반환 (유사 상품 추천)
    // URL: /api/recommendations/products/{productId}/similar
    @GetMapping("/products/{productId}/similar")
    public ResponseEntity<List<ProductDto>> getSimilarProducts(@PathVariable("productId") Long productId) {
        List<ProductDto> recommendations = recommendationService.getSimilarProducts(productId);
        if (recommendations.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recommendations);
    }

    // 특정 사용자를 위한 맞춤 추천 기억 물품 목록 반환 (개인화 추천)
    // URL: /api/recommendations/users/{userId}/personalized
    @GetMapping("/users/{userId}/personalized")
    public ResponseEntity<List<ProductDto>> getPersonalizedRecommendations(@PathVariable("userId") Long userId) {
        List<ProductDto> recommendations = recommendationService.getPersonalizedRecommendations(userId);
        if (recommendations.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(recommendations);
    }
}