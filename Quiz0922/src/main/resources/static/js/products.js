class ProductList {
    constructor() {
		// URL 쿼리 파라미터 초기화 (예: /products?category=CHILDHOOD)
		const urlParmas = new URLSearchParams(window.location.search);
		const initialCategory = urlParmas.get('category');
		
		// 검색 요청 DTO (ProductSearchRequest)와 매핑되는 현재 필터 상태
        this.currentFilters = {
            emotionLevelMin: 5, // int (최소값)
            category: initialCategory || '', // string (MemoryType Enum Name)
            priceRange: '', // string (PriceRange displayName)
            owner: '', // string (OwnerType displayName)
            search: '' // string (검색 키워드)
        };
        this.currentSort = 'newest'; // string (정렬 기준)
        this.currentPage = 0; // 현재 페이지 번호 (JPA 기준 0부터 시작)
        this.pageSize = 12; // 페이지당 항목 수
        this.isLoading = false;
        this.totalPages = 1; 

		// 현재 로드된 모든 상품 목록 데이터를 저장하는 배열 (ID로 객체 조회를 위해 사용)
		this.products = []; 
		
        this.initializeFilters();
        this.initializeViewModeControls();
        this.loadProducts(true); // 페이지 로드 시 상품 목록 초기 로드
		this.loadRecommendations(); // 페이지 로드 시 추천 상품 로드
    }

    /**
     * 초기 필터 상태 설정 및 검색 입력 디바운스 설정
     */
    initializeFilters() {
		const memoryTypeFilter = document.getElementById('memoryTypeFilter');
		// 1. URL 파라미터로 넘어온 초기 카테고리 필터 설정
		if (memoryTypeFilter && this.currentFilters.category) {
			memoryTypeFilter.value = this.currentFilters.category;
		}
		
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let debounceTimer;
            // 입력 후 500ms 동안 추가 입력이 없으면 검색 실행
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.filterProducts();
                }, 500);
            });
        }
    }
	
	/**
     * 추천 상품 목록 (사이드바)을 API에서 로드합니다.
     */
    async loadRecommendations() {
        const mt = window.memoryTreasures; 
        if (!mt || typeof mt.apiRequest !== 'function') return;

        try {
            // API Controller의 /api/recommendations/products 경로 사용 (희귀도 높은 순)
            const data = await mt.apiRequest(`/recommendations/products?size=5`);
            const recommendationsContent = document.getElementById('recommendationsContent');
            
            if (recommendationsContent) {
                recommendationsContent.innerHTML = data.map(product => this.createRecommendationCard(product)).join('');
            }
        } catch (error) {
            console.error('추천 상품 로드 실패:', error);
        }
    }
	
	/**
	 * 추천 상품 카드 HTML 생성
	 */
	createRecommendationCard(product) {
		return `
			<a href="/products/${product.id}" class="recommendation-card">
				<div class="icon" style="font-size: 2rem;">${product.memoryIcon || '🎁'}</div>
				<div class="info">
					<div class="title">${product.name}</div>
					<div class="price">${product.price ? product.price.toLocaleString() : '가격 미정'}원</div>
					<div class="meta">
						<span class="badge">강도 ${product.emotionLevel}/10</span>
						<span class="badge">희귀도 ${product.rarityScore}/10</span>
					</div>
				</div>
			</a>
		`;
	}

    /**
     * 격자/목록 보기 모드 변경 컨트롤러 초기화
     */
    initializeViewModeControls() {
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => this.changeViewMode(button.getAttribute('data-view')));
        });
    }

    /**
     * 상품 목록의 표시 방식을 변경합니다.
     */
    changeViewMode(viewType) {
        const container = document.getElementById('productsGrid');
        
        if (container) {
            container.classList.remove('view-grid', 'view-list');
            container.classList.add(`view-${viewType}`);
        }
        
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.view-btn[data-view="${viewType}"]`).classList.add('active');
    }

    /**
     * HTML 필터 값들을 DTO 객체에 바인딩하고 새로운 검색을 시작합니다.
     */
    filterProducts() {
        // 현재 HTML 요소의 값들을 필터 객체에 동기화
        this.currentFilters.category = document.getElementById('memoryTypeFilter').value;
        this.currentFilters.priceRange = document.getElementById('priceFilter').value; 
        this.currentFilters.owner = document.getElementById('ownerFilter').value;
        this.currentFilters.emotionLevelMin = parseInt(document.getElementById('emotionFilter').value); 
        this.currentSort = document.getElementById('sortFilter').value;
        
        this.currentPage = 0; // 새 검색은 무조건 0페이지부터 시작
        this.loadProducts(true); 
    }
    
    /**
     * API를 호출하여 상품 목록을 로드합니다.
     * @param {boolean} isNewSearch - 새로운 검색(필터 변경, 정렬 변경)인지, 아니면 더보기(페이지 증가)인지 여부
     */
    async loadProducts(isNewSearch = false) { 
        if (this.isLoading) return; 
        this.isLoading = true;
        
        const loadingIndicator = document.getElementById('loadingIndicator');
        const productsGrid = document.getElementById('productsGrid');
        
        if (loadingIndicator) loadingIndicator.style.display = 'inline';
        if (isNewSearch) {
            if (productsGrid) productsGrid.innerHTML = '';
            this.currentPage = 0; // 새 검색은 페이지 0부터 시작
        }
        
        // ⭐ 중요: 요청 페이지 번호 (새 검색이면 0, 더보기면 현재 페이지 + 1)
        const requestPage = isNewSearch ? 0 : this.currentPage + 1;
        
        try {
            // Spring Boot DTO (ProductSearchRequest)와 매핑되는 쿼리 파라미터 생성
            const queryParams = new URLSearchParams({
                page: requestPage, // 요청 페이지 번호 사용
                size: this.pageSize,
                sort: this.currentSort,
                emotionLevelMin: this.currentFilters.emotionLevelMin,
                // Null 대신 빈 문자열을 전달하여, 서버 DTO의 Custom Setter가 Null로 정제하도록 유도
                category: this.currentFilters.category || '',
                priceRange: this.currentFilters.priceRange || '',
                owner: this.currentFilters.owner || '',
                search: this.currentFilters.search || ''
            });

            const mt = window.memoryTreasures; 

            if (typeof mt === 'undefined' || typeof mt.apiRequest !== 'function') {
                 throw new Error("memory-treasures.js의 전역 memoryTreasures 객체 또는 apiRequest 함수가 정의되지 않았습니다.");
            }
            
            // API 호출: GET /api/products?page=...
            const data = await mt.apiRequest(`/products?${queryParams}`);
            
			// ⭐ 개선점 반영: API 호출 성공 시에만 페이지 업데이트
			this.currentPage = requestPage; 
			
			if (isNewSearch) {
				this.products = data.products || [];
			} else {
				this.products.push(...(data.products || []));
			}
			
            this.renderProducts(data.products || [], isNewSearch); 
            this.updateResultsCount(data.totalCount || 0); 
            this.totalPages = data.totalPages || 1;
            
        } catch (error) {
            console.error('상품 로드 실패:', error);
            const mt = window.memoryTreasures; 
            if (mt && typeof mt.showToast === 'function') {
                mt.showToast('상품을 불러오는데 실패했습니다. 서버 상태를 확인하세요.', 'error');
            }
            this.showEmptyState(true);
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            this.updateLoadMoreButton(); 
            this.isLoading = false;
        }
    }

    /**
     * 상품 목록을 HTML 컨테이너에 렌더링합니다.
     */
    renderProducts(products, isNewSearch) {
        const container = document.getElementById('productsGrid');
        
        if (!container) return;

        const html = products.map(product => this.createProductCard(product)).join('');
        
        if (!isNewSearch) {
            container.insertAdjacentHTML('beforeend', html); // 기존 목록 뒤에 추가 (더보기)
        } else {
            container.innerHTML = html; // 목록 전체 교체 (새 검색)
        }

        this.showEmptyState(container.children.length === 0);
    }
    
    /**
     * 검색 결과가 없을 때 표시되는 상태를 관리합니다.
     */
    showEmptyState(isEmpty) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = isEmpty ? 'flex' : 'none';
        }
    }

    /**
     * 단일 상품 정보를 기반으로 목록 카드 HTML을 생성합니다.
     * (ProductDto의 필드와 일치해야 함)
     */
    createProductCard(product) {
        const stockBadge = product.stock > 0 
            ? `<span class="stock-info in-stock">재고 ${product.stock}개</span>` 
            : `<span class="stock-info out-of-stock">품절</span>`;
        
        // 상세보기와 장바구니는 ID를 전역 함수에 전달합니다.
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="card-body">
                    <div style="font-size: 4rem; margin: 1rem 0;">
                        ${product.memoryIcon || '🎁'} 
                    </div>
                    <span class="badge bg-primary mb-2">희귀도 ${product.rarityScore}/10</span>
                    
                    <h6 class="card-title">${product.name}</h6>
                    <p class="card-text text-muted small">${product.description || ''}</p>
                    
                    <div class="mb-2">
                        <small class="text-muted">${product.originalOwner}의 기억</small>
                    </div>
                    
                    <div class="mb-2">
                        <span class="badge bg-secondary">감정 ${product.emotionLevel || '? '}/10</span>
                    </div>
                    
                    ${stockBadge}
                    
                    <h5 class="text-primary mt-3">${product.price ? product.price.toLocaleString() : '가격 미정'}원</h5>
                    
                    <div class="mt-3 product-actions">
                        <button class="btn btn-outline-primary btn-sm me-2" 
                                onclick="viewProductDetail(${product.id})">
                            상세보기
                        </button>
                        <button class="btn btn-primary btn-sm" 
                                onclick="addToCartFromProductList(${product.id})" 
                                ${product.stock === 0 ? 'disabled' : ''}>
                            장바구니
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 총 상품 개수 정보를 업데이트합니다.
     */
    updateResultsCount(totalCount) {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `총 ${totalCount.toLocaleString()}개의 기억`;
        }
    }
    
    /**
     * 더보기 버튼의 상태와 표시 여부를 업데이트합니다.
     */
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        if (loadMoreBtn && loadMoreContainer) {
            // 현재 페이지가 마지막 페이지라면 버튼 숨김
            if (this.currentPage + 1 >= this.totalPages) {
                loadMoreContainer.style.display = 'none'; 
            } else {
                loadMoreContainer.style.display = 'block';
                loadMoreBtn.disabled = this.isLoading;
            }
        }
    }
    
    /**
     * 모든 필터와 정렬 상태를 초기값으로 되돌리고 상품을 재로드합니다.
     */
    clearFilters() {
        this.currentFilters = {
            emotionLevelMin: 5, category: '', priceRange: '', owner: '', search: ''
        };
        this.currentSort = 'newest';
        
        // HTML 요소 초기화
        document.getElementById('memoryTypeFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('ownerFilter').value = '';
        document.getElementById('sortFilter').value = 'newest';
        
        const emotionRange = document.getElementById('emotionFilter');
        if (emotionRange) {
            emotionRange.value = '5'; 
            updateEmotionDisplay(5); // UI 표시 업데이트 함수 호출
        }
        
        document.getElementById('searchInput').value = '';

        this.currentPage = 0;
        this.loadProducts(true);
    }
}

// ----------------------------------------------------------------------
// 전역 함수 영역: HTML 이벤트 핸들러 (ProductList 인스턴스를 사용하도록 연결)
// ----------------------------------------------------------------------

// 필터 변경 시 호출되는 범용 함수 (필터/정렬 변경은 새 검색으로 취급)
function filterProducts() { window.productList.filterProducts(); }
function searchProducts() { window.productList.filterProducts(); }
function sortProducts() { window.productList.filterProducts(); }
function clearAllFilters() { window.productList.clearFilters(); }
function refreshProducts() { window.productList.loadProducts(true); }

// 더보기 버튼 클릭 시 다음 페이지를 로드
function loadMoreProducts() { 
    window.productList.loadProducts(false); // isNewSearch = false
}

/**
 * 상세보기 버튼 클릭 핸들러: 메모리 내 상품 목록에서 상품 객체를 찾아 모달에 렌더링합니다.
 * @param {number} productId - 조회할 상품 ID
 */
function viewProductDetail(productId) {
    const productList = window.productList;
	// ⭐️ 메모리에 있는 상품 목록(this.products)에서 조회
	const product = productList.products.find(p => p.id === productId);
	
	if (product) {
		renderProductDetails(product);
		openProductModal(); 
	} else {
		// 해당 상품이 메모리에 없을 경우 토스트 메시지 출력
		const mt = window.memoryTreasures;
		if (mt && typeof mt.showToast === 'function') {
			mt.showToast('상품 정보를 찾을 수 없습니다. 목록 새로고침을 시도하세요.', 'error');
		} else {
			console.error('상품 정보를 찾을 수 없습니다. ID:', productId);
		}
	}
}

/**
 * 장바구니 버튼 클릭 핸들러: 상품 ID로 객체를 찾아 memoryTreasures에 전달합니다.
 * @param {number} productId - 장바구니에 추가할 상품 ID
 */
function addToCartFromProductList(productId) {
    const mt = window.memoryTreasures;
	const productList = window.productList;
	
	// 메모리 내 상품 목록에서 상품 객체 조회
	const productToAdd = productList.products.find(p => p.id === productId);
	
    if (mt && typeof mt.addToCart === 'function' && productToAdd) {
        // memory-treasures.js의 addToCart 함수에 Product 객체 전체와 수량(기본 1)을 전달합니다.
        mt.addToCart(productToAdd, 1); 
        
        mt.showToast(`${productToAdd.name}을 장바구니에 담았습니다.`, 'success');
        
	} else {
		console.error("memoryTreasures 객체 또는 addToCart 함수가 정의되지 않았거나 상품 객체를 찾을 수 없습니다.");
        if (mt && typeof mt.showToast === 'function') {
             mt.showToast('장바구니 기능 오류: 스크립트가 로드되지 않았거나 상품을 찾을 수 없습니다.', 'error');
        }
    }
}

/**
 * 감정 강도 필터의 현재 값을 UI에 표시합니다.
 * @param {string} value - 감정 강도 최소값
 */
function updateEmotionDisplay(value) {
	const displayElement = document.getElementById('emotionDisplay');
	if (displayElement) {
		displayElement.textContent = value + ' 이상';
	}
}

// ======================================================================
// UI/Modal 컨트롤 영역
// ======================================================================

function toggleRecommendations() {
    const sidebar = document.getElementById('recommendationsSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('recommendationsSidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

function openProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = "block";
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = "none";
    }
}

/**
 * 조회된 상품 객체를 기반으로 모달에 상세 정보를 렌더링합니다.
 * @param {object} product - ProductResponse DTO 객체
 */
function renderProductDetails(product) {
    const detailsContainer = document.getElementById('productDetails');
    if (!detailsContainer) return;

    // 재고 상태에 따른 뱃지 표시
    const stockStatus = product.stock > 0 
        ? `<span class="badge badge-success" style="background:var(--success-color); color:white; padding: 4px 10px; border-radius:15px; font-weight:600;">재고 있음 (${product.stock}개)</span>` 
        : `<span class="badge badge-error" style="background:var(--error-color); color:white; padding: 4px 10px; border-radius:15px; font-weight:600;">품절</span>`;
        
    // 상세 모달 HTML 구조 (products.html의 modal-content-inner 스타일링에 의존)
    detailsContainer.innerHTML = `
        <div class="product-modal-content-inner">
            <div style="font-size: 4rem; margin: 1rem 0; text-align: center;">${product.memoryIcon || '🎁'}</div>
            <h2 style="text-align: center; margin-bottom: 0.5rem;">${product.name}</h2>
            <p class="text-muted" style="text-align: center; margin-bottom: 2rem;">${product.description || '상세 설명 없음'}</p>
            
            <div style="display:flex; justify-content: space-between; margin-bottom: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <div>
                    <strong>가격:</strong> 
                    <span style="font-size: 1.25rem; font-weight:700; color: var(--primary-color);">${product.price ? product.price.toLocaleString() : '가격 미정'}원</span>
                </div>
                <div>
                    <strong>희귀도:</strong> 
                    <span class="badge badge-accent" style="background:var(--accent-color); color:white; padding: 4px 10px; border-radius:15px; font-weight:600;">${product.rarityScore}/10</span>
                </div>
            </div>

            <div style="display:flex; justify-content: space-between; margin-bottom: 2rem;">
                <div>
                    <strong>감정 강도:</strong> 
                    <span class="badge badge-secondary" style="background:var(--secondary-color); color:white; padding: 4px 10px; border-radius:15px; font-weight:600;">${product.emotionLevel || '? '}/10</span>
                </div>
                <div>
                    <strong>원래 주인:</strong> 
                    <small class="text-muted">${product.originalOwner}의 기억</small>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 2rem;">
                ${stockStatus}
            </div>

            <div style="text-align: center;">
                <button class="btn btn-primary btn-large" 
                        onclick="addToCartFromProductList(${product.id}); closeProductModal();"
                        ${product.stock === 0 ? 'disabled' : ''}>
                    🛒 장바구니에 추가
                </button>
            </div>
        </div>
    `;
}

/**
 * DOM 로드 완료 시 ProductList 인스턴스를 생성하고 전역 window.productList에 할당합니다.
 */
document.addEventListener('DOMContentLoaded', function() {
    window.productList = new ProductList();
    
    // 페이지 로드 시 감정 강도 표시 UI 초기화
    const emotionRange = document.getElementById('emotionFilter');
    if (emotionRange) {
        updateEmotionDisplay(parseInt(emotionRange.value));
    }
});