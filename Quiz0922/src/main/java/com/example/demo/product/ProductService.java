package com.example.demo.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

// 상품 관련 핵심 비즈니스 로직을 처리합니다.
// 사용처: ProductController 및 ProductApiController에서 호출됩니다.
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

	private final ProductRepository productRepository;

	// 검색 요청(ProductSearchRequest)에 따라 상품 목록을 검색하고 페이징 처리합니다.
	// 사용처: ProductApiController.getProducts에서 호출됩니다.
	public ProductListResponse searchProducts(ProductSearchRequest request) {
		Sort sort = createSort(request.getSort());
		Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
		Specification<Product> spec = createSpecification(request);
		Page<Product> page = productRepository.findAll(spec, pageable);
		
		// Entity를 ProductResponse DTO로 변환하여 응답 객체에 담습니다.
		return ProductListResponse.builder()
				.products(page.getContent().stream().map(ProductResponse::of).toList())
				.totalCount(page.getTotalElements())
				.currentPage(page.getNumber() + 1)
				.totalPages(page.getTotalPages())
				.build();
	}
	
	// 정렬 요청 문자열에 따라 JPA Sort 객체를 생성합니다.
	private Sort createSort(String sort) {
		return switch (sort) {
		case "price-low" -> Sort.by("price").ascending();
		case "price-high" -> Sort.by("price").descending();
		case "emotion-high" -> Sort.by("emotionLevel").descending();
		case "rarity-high" -> Sort.by("rarityScore").descending();
		case "oldest" -> Sort.by("createdAt").ascending();
		default -> Sort.by("createdAt").descending();
		};
	}

	// ProductSearchRequest를 기반으로 동적 DB 쿼리 조건(JPA Specification)을 생성합니다.
	private Specification<Product> createSpecification(ProductSearchRequest request) {
		Specification<Product> spec = Specification.where(null);

		// 검색어 조건
		if (request.getSearch() != null && !request.getSearch().isEmpty()) {
			spec = spec.and((root, query, builder) ->
			builder.like(root.get("name"), "%" + request.getSearch() + "%"));
		}

		// 기억 주인(originalOwner) 필터 조건
		if (request.getOwner() != null && !request.getOwner().isEmpty()) {
			spec = spec.and((root, query, builder) ->
			builder.equal(root.get("originalOwner"), request.getOwner()));
		}

		// 감정 강도(emotionLevel) 최소값 필터 조건
		if (request.getEmotionLevelMin() != null && request.getEmotionLevelMin() > 0) {
			spec = spec.and((root, query, builder) ->
			builder.greaterThanOrEqualTo(root.get("emotionLevel"), request.getEmotionLevelMin()));
		}

		// 가격 범위(PriceRange) 필터 조건
		if (request.getPriceRange() != null && !request.getPriceRange().isEmpty()) {
			Optional<PriceRange> range = PriceRange.findByDisplayName(request.getPriceRange());
			if (range.isPresent()) {
				PriceRange pr = range.get();
				spec = spec.and((root, query, builder) ->
				builder.between(root.get("price"), pr.getMinPrice(), pr.getMaxPrice()));
			}
		}
		return spec;
	}
	
	// 단일 상품의 상세 정보를 조회합니다.
	// 사용처: ProductController.productDetail 및 ProductApiController.getProductDetail에서 호출됩니다.
	public ProductResponse getProductDetail(Long productId) {
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new IllegalArgumentException("ID " + productId + "에 해당하는 상품을 찾을 수 없습니다."));
		return ProductResponse.of(product);
	}

	// 특정 상품과 관련된 상품 목록(추천 상품)을 조회합니다.
	// 사용처: ProductController.productDetail에서 호출되어 관련 상품 목록을 템플릿에 전달합니다.
	public List<ProductResponse> getRelatedProducts(Long productId) {
		Product baseProduct = productRepository.findById(productId)
				.orElse(null);
		
		if (baseProduct == null) {
			return List.of();
		}
		
		// 1. 같은 MemoryType을 가지면서, 
		// 2. 자기 자신을 제외한 상품을, 
		// 3. 희귀도(rarityScore)가 높은 순으로 최대 3개 조회합니다.
		MemoryType memoryType = baseProduct.getMemoryType();
		Pageable pageable = PageRequest.of(0, 3, Sort.by("rarityScore").descending());
		Specification<Product> spec = Specification.<Product>where(
				(root, query, builder) -> builder.equal(root.get("memoryType"), memoryType)
		)
		.and(
			(root, query, builder) -> builder.notEqual(root.get("id"), productId)
		);
		List<Product> relatedProducts = productRepository.findAll(spec, pageable).getContent();
		
		// Entity를 ProductResponse DTO로 변환하여 반환합니다.
		return relatedProducts.stream()
			.map(ProductResponse::of)
			.toList();
	}

}