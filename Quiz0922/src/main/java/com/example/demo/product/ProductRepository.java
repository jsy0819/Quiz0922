package com.example.demo.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

// 상품 Entity에 대한 DB 접근을 담당하는 인터페이스
// 사용처: ProductService에서 DB 조회, 검색, 페이징 처리를 위해 의존.
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
	// JpaRepository: 기본 CRUD 및 단일 Entity 조회 기능 제공
	// JpaSpecificationExecutor: 동적 검색 조건(Specification)을 사용할 수 있도록 지원
}