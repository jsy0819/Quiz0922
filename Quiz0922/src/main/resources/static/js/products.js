// Memory Treasures - 상품 목록 관리 스크립트
class ProductList {
    constructor() {
        this.currentFilters = {
            // ⭐ [추가] 감정 강도 최소값 필터가 추가됨 (기존 코드에는 없었음)
            emotionLevelMin: 5, 
            category: '',
            priceRange: '',
            owner: '',
            search: ''
        };
        this.currentSort = 'newest';
        this.currentPage = 1;
        this.pageSize = 12;
        // ⭐ [추가] 로딩 상태 및 전체 페이지 수 추적 필드가 추가됨
        this.isLoading = false;
        this.totalPages = 1; 
        
        this.initializeFilters();
        // ⭐ [추가] 뷰 모드(격자/목록) 버튼 클릭을 처리하는 로직 초기화
        this.initializeViewModeControls(); 
    }

    initializeFilters() {
        const searchInput = document.getElementById('searchInput'); // ⭐ [ID 변경] 'search-input'에서 'searchInput'으로 ID가 변경되었습니다.
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.filterProducts(); // ⭐ [메서드 변경] loadProducts() 대신 filterProducts() 호출로 변경되었습니다.
                }, 500);
            });
        }

        const categorySelect = document.getElementById('memoryTypeFilter'); // ⭐ [ID 변경] 'category-filter'에서 'memoryTypeFilter'로 ID가 변경되었습니다.
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.filterProducts()); // ⭐ [메서드 변경] loadProducts() 대신 filterProducts() 호출로 변경되었습니다.
        }

        const priceSelect = document.getElementById('priceFilter'); // ⭐ [ID 변경] 'price-filter'에서 'priceFilter'로 ID가 변경되었습니다.
        if (priceSelect) {
            priceSelect.addEventListener('change', () => this.filterProducts()); // ⭐ [메서드 변경] loadProducts() 대신 filterProducts() 호출로 변경되었습니다.
        }

        const ownerSelect = document.getElementById('ownerFilter'); // ⭐ [ID 변경] 'owner-filter'에서 'ownerFilter'로 ID가 변경되었습니다.
        if (ownerSelect) {
            ownerSelect.addEventListener('change', () => this.filterProducts()); // ⭐ [메서드 변경] loadProducts() 대신 filterProducts() 호출로 변경되었습니다.
        }

        // ⭐ [추가] 감정 강도 필터(emotionRange) 초기화 로직이 추가되었습니다.
        const emotionRange = document.getElementById('emotionFilter');
        if (emotionRange) {
            emotionRange.addEventListener('change', () => this.filterProducts());
            updateEmotionDisplay(emotionRange.value); 
        }

        const sortSelect = document.getElementById('sortFilter'); // ⭐ [ID 변경] 'sort-filter'에서 'sortFilter'로 ID가 변경되었습니다.
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.filterProducts()); // ⭐ [메서드 변경] loadProducts() 대신 filterProducts() 호출로 변경되었습니다.
        }

        this.setFiltersFromURL();
    }
    
    // ⭐ [추가] 뷰 모드(격자/목록) 제어 로직 초기화 메서드
    initializeViewModeControls() {
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => this.changeViewMode(button.getAttribute('data-view')));
        });
    }

    // ⭐ [추가] 뷰 모드 변경 실행 메서드
    changeViewMode(viewType) {
        const container = document.getElementById('productsGrid'); // ⭐ [ID 변경] 'products-container'에서 'productsGrid'로 변경되었습니다.
        
        // 1. 컨테이너 클래스 변경
        if (container) {
            if (viewType === 'list') {
                container.classList.remove('view-grid');
                container.classList.add('view-list');
            } else { // 'grid'
                container.classList.remove('view-list');
                container.classList.add('view-grid');
            }
        }
        
        // 2. 버튼 활성화 상태 변경
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.view-btn[data-view="${viewType}"]`).classList.add('active');
    }

    // ⭐ [추가] 필터 값을 모아서 currentPage를 1로 초기화하고 loadProducts(true)를 호출하는 전용 메서드
    filterProducts() {
        // ⭐ [ID 변경] 새로운 ID들을 사용하여 현재 필터 값을 this.currentFilters에 저장합니다.
        this.currentFilters.category = document.getElementById('memoryTypeFilter').value;
        this.currentFilters.priceRange = document.getElementById('priceFilter').value;
        this.currentFilters.owner = document.getElementById('ownerFilter').value;
        this.currentFilters.emotionLevelMin = parseInt(document.getElementById('emotionFilter').value); // ⭐ 감정 강도 필터 추가
        this.currentSort = document.getElementById('sortFilter').value;
        
        this.currentPage = 1;
        this.loadProducts(true); // ⭐ 새로운 검색임을 알리는 true 인자 전달
    }

    setFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('category')) {
            this.currentFilters.category = urlParams.get('category');
            const categorySelect = document.getElementById('memoryTypeFilter'); // ⭐ [ID 변경]
            if (categorySelect) categorySelect.value = this.currentFilters.category;
        }

        if (urlParams.get('search')) {
            this.currentFilters.search = urlParams.get('search');
            const searchInput = document.getElementById('searchInput'); // ⭐ [ID 변경]
            if (searchInput) searchInput.value = this.currentFilters.search;
        }
        
        this.filterProducts(); // ⭐ [메서드 변경] 필터 적용 후 loadProducts() 대신 filterProducts() 호출로 변경되었습니다.
    }

    // ⭐ [변경] loadProducts 메서드 시그니처가 loadProducts(isNewSearch = false)로 변경되었고 내부 로직이 업데이트되었습니다.
    async loadProducts(isNewSearch = false) { 
        // ⭐ [추가] 로딩 중 중복 호출 방지 로직
        if (this.isLoading) return; 
        this.isLoading = true;
        
        const loadingIndicator = document.getElementById('loadingIndicator'); // ⭐ [ID 변경]
        const productsGrid = document.getElementById('productsGrid'); // ⭐ [ID 변경]
        // ⭐ [추가] '더 보기' 버튼 및 '빈 상태' 요소 추가
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const emptyState = document.getElementById('emptyState');
        
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.disabled = true;

        // ⭐ [추가] 새로운 검색일 경우 목록 초기화 및 페이지 리셋
        if (isNewSearch) {
            if (productsGrid) productsGrid.innerHTML = '';
            this.currentPage = 1;
        }

        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                size: this.pageSize,
                sort: this.currentSort,
                // ⭐ [추가] emotionLevelMin 필터가 쿼리 파라미터에 추가되었습니다.
                emotionLevelMin: this.currentFilters.emotionLevelMin,
                // ⭐ [ID 변경에 따른 필드명 유지]
                category: this.currentFilters.category,
                priceRange: this.currentFilters.priceRange,
                owner: this.currentFilters.owner,
                search: this.currentFilters.search
            });

            // API 호출 경로는 유지됩니다.
            const response = await fetch(`/api/products?${queryParams}`); 
            const data = await response.json(); 
            
            // ⭐ [변경] renderProducts에 isNewSearch 인자를 전달
            this.renderProducts(data.products, isNewSearch); 
            this.updateResultsCount(data.totalCount); 
            this.totalPages = data.totalPages; // ⭐ [추가] 전체 페이지 수 업데이트
            
        } catch (error) {
            console.error('상품 로드 실패:', error);
            this.showError('상품을 불러오는데 실패했습니다.');
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            this.updateLoadMoreButton(); // ⭐ [추가] '더 보기' 버튼 상태 업데이트
            this.isLoading = false;
        }
    }

    // ⭐ [변경] renderProducts 메서드 시그니처가 renderProducts(products, isNewSearch)로 변경되었고 내부 로직이 업데이트되었습니다.
    renderProducts(products, isNewSearch) { 
        const container = document.getElementById('productsGrid'); // ⭐ [ID 변경]
        const emptyState = document.getElementById('emptyState'); // ⭐ [추가] 빈 상태 요소
        
        if (!container) return;

        // ⭐ [추가] isNewSearch에 따라 목록을 덮어쓸지(innerHTML) 이어 붙일지(insertAdjacentHTML) 결정하는 로직 추가
        if (!isNewSearch) {
            container.insertAdjacentHTML('beforeend', products.map(product => this.createProductCard(product)).join(''));
        } else {
            container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        }

        // ⭐ [추가] 빈 상태 표시 로직
        if (products.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
        }
    }

    createProductCard(product) {
        // ... (내부 로직은 거의 동일하지만, Product DTO 변경에 맞춰 property 접근 시 null 체크 추가됨)
        // ...
        
        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm product-card" data-product-id="${product.id}">
                    <div class="card-body text-center">
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
                        
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm me-2" 
                                    onclick="viewProductDetail('${product.id}')">
                                상세보기
                            </button>
                            <button class="btn btn-primary btn-sm" 
                                    onclick="addToCart('${product.id}')"
                                    ${product.stock === 0 ? 'disabled' : ''}>
                                장바구니
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateResultsCount(totalCount) {
        const countElement = document.getElementById('resultsCount'); // ⭐ [ID 변경]
        if (countElement) {
            countElement.textContent = `총 ${totalCount}개의 기억`;
        }
    }

    updatePagination(currentPage, totalPages) {
        // ⭐ [삭제] 기존 페이지네이션 로직이 삭제되었습니다. (무한 스크롤/더 보기 버튼으로 대체됨)
        // ... (페이지네이션 로직은 생략)
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ⭐ [추가] '더 보기' 상품 로드 로직
    loadMoreProducts() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++; 
            this.loadProducts(false);
        }
    }
    
    // ⭐ [추가] '더 보기' 버튼 활성화/비활성화 로직
    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (this.currentPage >= this.totalPages) {
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        } else {
            if (loadMoreContainer) loadMoreContainer.style.display = 'block';
            if (loadMoreBtn) loadMoreBtn.disabled = false;
        }
    }

    clearFilters() {
        this.currentFilters = {
            emotionLevelMin: 5, // ⭐ 감정 강도 필터 초기화 추가
            category: '',
            priceRange: '',
            owner: '',
            search: ''
        };
        
        // ⭐ [ID 변경] 새로운 ID들을 사용하여 UI를 초기화합니다.
        document.getElementById('memoryTypeFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('ownerFilter').value = '';
        
        // ⭐ [추가] 감정 강도 필터 UI 초기화 로직
        const emotionRange = document.getElementById('emotionFilter');
        if (emotionRange) {
            emotionRange.value = '5'; 
            updateEmotionDisplay(5);
        }
        
        document.getElementById('searchInput').value = ''; // ⭐ [ID 변경]

        this.currentPage = 1;
        this.loadProducts(true); // ⭐ 새로운 검색임을 알리는 true 인자 전달
    }

    showError(message) {
        const container = document.getElementById('products-container'); // ⭐ [ID 변경]
        if (container) {
            // ... (에러 표시 로직 유지)
        }
    }
}

// ----------------------------------------------------------------------
// 전역 함수 영역: HTML 이벤트 핸들러
// ----------------------------------------------------------------------

const productList = new ProductList();

// ⭐ [추가] 추천 사이드바 열기/닫기 토글 함수
function toggleRecommendations() {
    const sidebar = document.getElementById('recommendationsSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// ⭐ [추가] 추천 사이드바 닫기 함수
function closeSidebar() {
    const sidebar = document.getElementById('recommendationsSidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

// ⭐ [추가] 감정 강도 범위 값 표시 업데이트 함수 (HTML의 oninput과 연결)
function updateEmotionDisplay(value) {
	const displayElement = document.getElementById('emotionDisplay');
	if (displayElement) {
		displayElement.textContent = value + ' 이상';
	}
}

// ⭐ [변경] 기존에는 loadProducts()를 직접 호출했지만, 이제는 filterProducts()를 호출합니다.
function filterProducts() {
	productList.filterProducts();
}

// ⭐ [변경] 기존에는 loadProducts()를 직접 호출했지만, 이제는 filterProducts()를 호출합니다.
function searchProducts() {
	productList.filterProducts();
}

function clearAllFilters() {
	productList.clearFilters();
}

function refreshProducts() {
	productList.currentPage = 1;
	productList.loadProducts(true);
}

function loadMoreProducts() {
	productList.loadMoreProducts();
}

function viewProductDetail(productId) {
    // Thymeleaf URL을 고려하여 URL 수정
    window.location.href = `/products.html/${productId}`;
}

function viewByCategory(category) {
    // Thymeleaf 환경을 고려하여 URL 수정
    window.location.href = `/products.html?category=${category}`;
}
// ⭐ [삭제] DOM 로드 시 productList.loadProducts()를 직접 호출하는 코드가 삭제되었습니다.
// 대신 constructor() -> setFiltersFromURL() -> filterProducts() -> loadProducts() 체인으로 로드가 시작됩니다.