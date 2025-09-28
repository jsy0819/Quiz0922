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

// =========================================================================
// Product Service: 상품 관련 핵심 비즈니스 로직 처리
// =========================================================================
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

	private final ProductRepository productRepository;

	/**
	 * 상품 검색 요청(ProductSearchRequest)에 따라 상품 목록을 검색하고 페이징 처리합니다.
	 * - DTO에서 이미 빈 필터 값이 Null로 정제되었으므로, Null 체크만 수행하여 안전하게 쿼리합니다.
	 * @param request 검색 조건 DTO
	 * @return 페이징된 상품 목록 및 정보 응답 DTO
	 */
	public ProductListResponse searchProducts(ProductSearchRequest request) {
		Sort sort = createSort(request.getSort());
		Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
		Specification<Product> spec = createSpecification(request);
		
		Page<Product> page = productRepository.findAll(spec, pageable);
		
		return ProductListResponse.builder()
				// ⭐ ProductDto 대신 ProductResponse::of 사용하도록 변경
				.products(page.getContent().stream().map(ProductResponse::of).toList()) 
				.totalCount(page.getTotalElements())
				.currentPage(page.getNumber() + 1) // 프론트엔드 편의를 위해 1부터 시작
				.totalPages(page.getTotalPages())
				.build();
	}
	
	/**
	 * 정렬 요청 문자열에 따라 JPA Sort 객체를 생성합니다.
	 */
	private Sort createSort(String sort) {
		return switch (sort) {
		case "price-low" -> Sort.by("price").ascending();
		case "price-high" -> Sort.by("price").descending();
		case "emotion-high" -> Sort.by("emotionLevel").descending();
		case "rarity-high" -> Sort.by("rarityScore").descending();
		case "oldest" -> Sort.by("createdAt").ascending();
		default -> Sort.by("createdAt").descending(); // 기본값: 최신순 (createdAt 내림차순)
		};
	}

	/**
	 * ProductSearchRequest를 기반으로 동적 DB 쿼리 조건(JPA Specification)을 생성합니다.
	 */
	private Specification<Product> createSpecification(ProductSearchRequest request) {
		Specification<Product> spec = Specification.where(null);

		// 검색어 조건
		if (request.getSearch() != null) { 
			spec = spec.and((root, query, builder) ->
			builder.like(root.get("name"), "%" + request.getSearch() + "%"));
		}

		// 기억 주인(originalOwner) 필터 조건 (OwnerType.displayName 문자열 일치)
		if (request.getOwner() != null) {
			spec = spec.and((root, query, builder) ->
			builder.equal(root.get("originalOwner"), request.getOwner()));
		}
		
		// 기억 종류(category) 필터 조건 (MemoryType Enum의 Name과 일치)
		if (request.getCategory() != null) {
			try {
				// MemoryType Enum의 Name(대문자)으로 변환 후 DB의 Enum String과 비교
				spec = spec.and((root, query, builder) ->
				builder.equal(root.get("memoryType"), MemoryType.valueOf(request.getCategory())));
			} catch (IllegalArgumentException e) {
				// 유효하지 않은 Enum 값일 경우: 해당 조건을 무시하고 검색을 진행합니다.
				System.err.println("경고: 유효하지 않은 MemoryType 요청 -> 검색 조건 무시: " + request.getCategory());
			}
		}

		// 감정 강도(emotionLevel) 최소값 필터 조건
		if (request.getEmotionLevelMin() != null && request.getEmotionLevelMin() > 0) {
			spec = spec.and((root, query, builder) ->
			builder.greaterThanOrEqualTo(root.get("emotionLevel"), request.getEmotionLevelMin()));
		}

		// 가격 범위(PriceRange) 필터 조건 (PriceRange Enum의 displayName을 기반으로 매핑)
		if (request.getPriceRange() != null) {
			Optional<PriceRange> range = PriceRange.findByDisplayName(request.getPriceRange());
			if (range.isPresent()) {
				PriceRange pr = range.get();
				spec = spec.and((root, query, builder) ->
				builder.between(root.get("price"), pr.getMinPrice(), pr.getMaxPrice()));
			}
		}
		return spec;
	}
	
	/**
	 * 단일 상품의 상세 정보를 조회합니다. (View Controller와 API Controller 모두에서 사용)
	 * @param productId 조회할 상품 ID
	 * @return 상품 상세 정보 DTO
	 * @throws IllegalArgumentException 상품을 찾을 수 없을 때 발생
	 */
	public ProductResponse getProductDetail(Long productId) {
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new IllegalArgumentException("ID " + productId + "에 해당하는 상품을 찾을 수 없습니다."));
		return ProductResponse.of(product);
	}

	/**
	 * 추천 상품 목록 조회: 희귀도 점수(rarityScore)가 높은 순으로 N개 조회합니다.
	 * @param size 조회할 상품 개수
	 * @return 추천 상품 목록 DTO 리스트 (조회 실패 시 빈 리스트 반환)
	 */
	public List<ProductResponse> getTopNByRarity(int size) {
		try {
			// 희귀도(rarityScore) 내림차순으로 정렬하여 상위 N개를 조회합니다.
			Pageable pageable = PageRequest.of(0, size, Sort.by("rarityScore").descending()); 
			
			List<Product> topProducts = productRepository.findAll(pageable).getContent();
			
			return topProducts.stream()
				.map(ProductResponse::of)
				.toList();
		} catch (Exception e) {
			// DB 연결이나 쿼리 실행 중 예외 발생 시 빈 목록을 반환하여 API의 500 에러를 방지합니다.
			System.err.println("경고: 추천 상품 조회 중 예외 발생. 빈 목록 반환.");
			e.printStackTrace();
			return List.of(); 
		}
	}
	
	/**
	 * 관련 상품 목록 조회 (상품 상세 페이지 하단 추천에 사용됨)
	 */
	public List<ProductResponse> getRelatedProducts(Long productId) {
		Product baseProduct = productRepository.findById(productId)
				.orElse(null);
		
		if (baseProduct == null) {
			return List.of();
		}
		
		// 같은 MemoryType을 가지면서, 자기 자신을 제외한 상품 조회 (최대 3개)
		MemoryType memoryType = baseProduct.getMemoryType();
		Pageable pageable = PageRequest.of(0, 3, Sort.by("rarityScore").descending());
		
		Specification<Product> spec = Specification.<Product>where(
			(root, query, builder) -> builder.equal(root.get("memoryType"), memoryType)
		)
		.and(
			(root, query, builder) -> builder.notEqual(root.get("id"), productId)
		);
		
		List<Product> relatedProducts = productRepository.findAll(spec, pageable).getContent();
		
		return relatedProducts.stream()
			.map(ProductResponse::of)
			.toList();
	}
}