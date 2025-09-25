// Memory Treasures - 상품 목록 관리 스크립트
class ProductList {
    constructor() {
        this.currentFilters = {
            category: '',
            priceRange: '',
            owner: '',
            search: ''
        };
        this.currentSort = 'newest';
        this.currentPage = 1;
        this.pageSize = 12;
        
        this.initializeFilters();
    }

    // 필터 초기화
    initializeFilters() {
        // 검색 입력 이벤트
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.loadProducts();
                }, 500);
            });
        }

        // 카테고리 필터
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.loadProducts();
            });
        }

        // 가격 범위 필터
        const priceSelect = document.getElementById('price-filter');
        if (priceSelect) {
            priceSelect.addEventListener('change', (e) => {
                this.currentFilters.priceRange = e.target.value;
                this.loadProducts();
            });
        }

        // 기억 주인 필터
        const ownerSelect = document.getElementById('owner-filter');
        if (ownerSelect) {
            ownerSelect.addEventListener('change', (e) => {
                this.currentFilters.owner = e.target.value;
                this.loadProducts();
            });
        }

        // 정렬 옵션
        const sortSelect = document.getElementById('sort-filter');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.loadProducts();
            });
        }

        // URL 파라미터에서 초기 필터 설정
        this.setFiltersFromURL();
    }

    // URL 파라미터로부터 필터 설정
    setFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('category')) {
            this.currentFilters.category = urlParams.get('category');
            const categorySelect = document.getElementById('category-filter');
            if (categorySelect) categorySelect.value = this.currentFilters.category;
        }

        if (urlParams.get('search')) {
            this.currentFilters.search = urlParams.get('search');
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = this.currentFilters.search;
        }
    }

    // 상품 목록 로드
    async loadProducts() {
        const loadingIndicator = document.getElementById('loading-indicator');
        const productsContainer = document.getElementById('products-container');
        
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                size: this.pageSize,
                sort: this.currentSort,
                ...this.currentFilters
            });

            const response = await fetch(`/api/products?${queryParams}`);
            const data = await response.json();
            
            this.renderProducts(data.products);
            this.updateResultsCount(data.totalCount);
            this.updatePagination(data.currentPage, data.totalPages);
            
        } catch (error) {
            console.error('상품 로드 실패:', error);
            this.showError('상품을 불러오는데 실패했습니다.');
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    // 상품 목록 렌더링
    renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div style="font-size: 4rem;">😅</div>
                    <h3>기억을 찾을 수 없어요</h3>
                    <p>다른 조건으로 검색해보세요!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    // 상품 카드 HTML 생성
    createProductCard(product) {
        const stockBadge = product.stock > 0 ? 
            `<span class="badge bg-success">재고 ${product.stock}개</span>` : 
            `<span class="badge bg-danger">품절</span>`;

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm product-card" data-product-id="${product.id}">
                    <div class="card-body text-center">
                        <div style="font-size: 4rem; margin: 1rem 0;">
                            ${product.memoryIcon || '🎁'}
                        </div>
                        <span class="badge bg-primary mb-2">희귀도 ${product.rarityScore}/10</span>
                        
                        <h6 class="card-title">${product.name}</h6>
                        <p class="card-text text-muted small">${product.description}</p>
                        
                        <div class="mb-2">
                            <small class="text-muted">${product.originalOwner}의 기억</small>
                        </div>
                        
                        <div class="mb-2">
                            <span class="badge bg-secondary">감정 ${product.emotionLevel}/10</span>
                        </div>
                        
                        ${stockBadge}
                        
                        <h5 class="text-primary mt-3">${product.price.toLocaleString()}원</h5>
                        
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

    // 검색 결과 개수 업데이트
    updateResultsCount(totalCount) {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = `총 ${totalCount}개의 기억`;
        }
    }

    // 페이지네이션 업데이트
    updatePagination(currentPage, totalPages) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer || totalPages <= 1) return;

        let paginationHTML = '<nav><ul class="pagination justify-content-center">';
        
        // 이전 페이지
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="productList.goToPage(${currentPage - 1})">이전</a>
            </li>
        `;

        // 페이지 번호들
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="productList.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        // 다음 페이지
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="productList.goToPage(${currentPage + 1})">다음</a>
            </li>
        `;

        paginationHTML += '</ul></nav>';
        paginationContainer.innerHTML = paginationHTML;
    }

    // 페이지 이동
    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 필터 초기화
    clearFilters() {
        this.currentFilters = {
            category: '',
            priceRange: '',
            owner: '',
            search: ''
        };
        
        // UI 초기화
        const filterElements = ['category-filter', 'price-filter', 'owner-filter', 'search-input'];
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        this.currentPage = 1;
        this.loadProducts();
    }

    // 에러 메시지 표시
    showError(message) {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">${message}</div>
                </div>
            `;
        }
    }
}

// 상품 상세 페이지로 이동
function viewProductDetail(productId) {
    window.location.href = `/products/${productId}`;
}

// 카테고리별 상품 보기
function viewByCategory(category) {
    window.location.href = `/products?category=${category}`;
}

// 전역 상품 목록 인스턴스
const productList = new ProductList();

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    productList.loadProducts();
});