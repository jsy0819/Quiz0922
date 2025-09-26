package com.example.demo.recommendation;

import com.example.demo.product.MemoryType;
import com.example.demo.product.Product;
import com.example.demo.product.ProductDto;
import com.example.demo.product.ProductRepository;
import com.example.demo.user.CharacterType;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor 
@Transactional(readOnly = true) 
public class RecommendationService {
    private final ProductRepository productRepository;
    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;

    // 유사 상품 추천 기능: 특정 상품과 비슷한 상품을 찾아줌
    public List<ProductDto> getSimilarProducts(Long productId) {
        // 1. 기준이 되는 상품(baseProduct)을 찾음
        Product baseProduct = productRepository.findById(productId).orElse(null);
        if (baseProduct == null) {
            return List.of(); // 상품이 없으면 빈 리스트 반환
        }

        // 2. 모든 상품을 순회하며 유사도를 계산하고 정렬
        return productRepository.findAll().stream()
                .filter(p -> !p.getId().equals(productId)) // 자기 자신은 추천 목록에서 제외
                .sorted(Comparator.comparingDouble(p -> -calculateSimilarity(baseProduct, p))) // 유사도 점수가 높은 순으로 정렬
                .limit(4) // 상위 4개만 선택
                .map(ProductDto::from) // Product 엔티티를 ProductDto로 변환
                .collect(Collectors.toList()); // 리스트로 모아서 반환
    }

    // 유사도 점수 계산 로직: 두 상품의 속성을 비교
    private double calculateSimilarity(Product p1, Product p2) {
        double score = 0; // [변수명]: score
        
        // 1. 기억 종류(MemoryType)가 같으면 30점 추가
        if (p1.getMemoryType() != null && p1.getMemoryType().equals(p2.getMemoryType())) {
            score += 30;
        }
        // 2. 원래 주인이 같으면 20점 추가
        if (p1.getOriginalOwner() != null && p1.getOriginalOwner().equals(p2.getOriginalOwner())) {
            score += 20;
        }

        // 3. 감정 강도 차이만큼 감점 (차이가 작을수록 높은 점수)
        if (p1.getEmotionLevel() != null && p2.getEmotionLevel() != null) {
            score -= Math.abs(p1.getEmotionLevel() - p2.getEmotionLevel()) * 2;
        }
        // 4. 희귀도 점수 차이만큼 감점
        if (p1.getRarityScore() != null && p2.getRarityScore() != null) {
            score -= Math.abs(p1.getRarityScore() - p2.getRarityScore()) * 3;
        }

        return score; // 최종 유사도 점수 반환
    }

    // 맞춤 추천 기능: 로그인한 사용자의 캐릭터에 맞춰 추천
    public List<ProductDto> getPersonalizedRecommendations(Long userId) {
        // 1. userId를 이용해 사용자 정보를 조회
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
             return List.of(); // 사용자가 없으면 빈 리스트 반환
        }
        
        // 2. 사용자의 캐릭터 타입에 따라 다른 추천 로직 적용
        CharacterType userCharacterType = user.getCharacterType();

        List<Product> recommendedProducts;
        switch (userCharacterType) {
            case WAFFLEBEAR:
                // 와플곰(과학자)에게는 '실험' 관련 상품을 우선 추천
                recommendedProducts = productRepository.findAll().stream()
                        .filter(p -> p.getMemoryType() == MemoryType.EXPERIMENT)
                        .limit(6)
                        .collect(Collectors.toList());
                break;
            case TOSIM:
                // 토심이(감성가)에게는 '어린시절' 관련 상품을 우선 추천
                recommendedProducts = productRepository.findAll().stream()
                        .filter(p -> p.getMemoryType() == MemoryType.CHILDHOOD)
                        .limit(6)
                        .collect(Collectors.toList());
                break;
            case TANGO:
                // 탱고(모험가)에게는 '모험' 관련 상품을 우선 추천
                recommendedProducts = productRepository.findAll().stream()
                        .filter(p -> p.getMemoryType() == MemoryType.ADVENTURE)
                        .limit(6)
                        .collect(Collectors.toList());
                break;
            default:
                // 그 외 캐릭터에게는 일반적인 추천 (모든 상품 중 6개)
                recommendedProducts = productRepository.findAll().stream()
                        .limit(6)
                        .collect(Collectors.toList());
                break;
        }
        
        // 3. 추천된 상품들을 DTO로 변환하여 반환
        return recommendedProducts.stream()
                .map(ProductDto::from)
                .collect(Collectors.toList());
    }
}