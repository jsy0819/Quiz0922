class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.updateCartDisplay();
    }

    // 장바구니에 상품 추가
    addItem(productId, quantity = 1) {
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveToStorage();
        this.updateCartDisplay();
        this.showToast(`장바구니에 추가되었습니다! 🛒`, 'success');
    }

    // 장바구니에서 상품 제거
    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveToStorage();
        this.updateCartDisplay();
        this.showToast('상품이 제거되었습니다.', 'info');
    }

    // 수량 변경
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateCartDisplay();
            }
        }
    }

    // 장바구니 비우기
    clearCart() {
        if (confirm('장바구니를 모두 비우시겠어요?')) {
            this.items = [];
            this.saveToStorage();
            this.updateCartDisplay();
            this.showToast('🐕 누렁이: "장바구니가 비워졌어요... 기억들이 사라졌네..."', 'info');
        }
    }

    // 총 상품 개수
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // 로컬스토리지에 저장
    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // 장바구니 UI 업데이트
    updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
        const totalItems = this.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });

        // 장바구니 페이지에서 목록 업데이트
        if (window.location.pathname.includes('cart')) {
            this.renderCartItems();
        }
    }

    // 장바구니 아이템 렌더링 (장바구니 페이지용)
    renderCartItems() {
        const cartContainer = document.getElementById('cart-items');
        const emptyState = document.getElementById('empty-cart');
        
        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        cartContainer.style.display = 'block';

        // 서버에서 상품 정보를 가져와서 렌더링
        this.fetchCartItemsData().then(items => {
            cartContainer.innerHTML = items.map(item => this.createCartItemHTML(item)).join('');
            this.updateCartSummary(items);
        });
    }

    // 장바구니 상품 HTML 생성
    createCartItemHTML(item) {
        return `
            <div class="cart-item border-bottom py-3" data-product-id="${item.productId}">
                <div class="row align-items-center">
                    <div class="col-md-2 text-center">
                        <div style="font-size: 3rem;">${item.memoryIcon || '🎁'}</div>
                    </div>
                    <div class="col-md-4">
                        <h6>${item.name}</h6>
                        <p class="text-muted small">${item.originalOwner}의 기억</p>
                        <span class="badge bg-secondary">희귀도 ${item.rarityScore}/10</span>
                    </div>
                    <div class="col-md-2">
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary" onclick="cart.updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                            <input type="number" class="form-control text-center" value="${item.quantity}" 
                                   onchange="cart.updateQuantity('${item.productId}', this.value)" min="1">
                            <button class="btn btn-outline-secondary" onclick="cart.updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <strong>${(item.price * item.quantity).toLocaleString()}원</strong>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-outline-danger btn-sm" onclick="cart.removeItem('${item.productId}')">
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 장바구니 요약 업데이트
    updateCartSummary(items) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = subtotal >= 50000 ? 0 : 3000;
        const total = subtotal + shippingFee;

        const subtotalElement = document.getElementById('cart-subtotal');
        const shippingElement = document.getElementById('cart-shipping');
        const totalElement = document.getElementById('cart-total');

        if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString() + '원';
        if (shippingElement) shippingElement.textContent = shippingFee.toLocaleString() + '원';
        if (totalElement) totalElement.textContent = total.toLocaleString() + '원';
    }

    // 서버에서 장바구니 상품 정보 가져오기
    async fetchCartItemsData() {
        if (this.items.length === 0) return [];
        
        try {
            const productIds = this.items.map(item => item.productId).join(',');
            const response = await fetch(`/api/products/cart?ids=${productIds}`);
            const products = await response.json();
            
            return this.items.map(cartItem => {
                const product = products.find(p => p.id == cartItem.productId);
                return {
                    ...product,
                    quantity: cartItem.quantity,
                    productId: cartItem.productId
                };
            }).filter(item => item.id); // 존재하는 상품만
        } catch (error) {
            console.error('장바구니 상품 정보 로드 실패:', error);
            return [];
        }
    }

    // 토스트 메시지
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// 전역 장바구니 인스턴스
const cart = new Cart();

// 장바구니에 추가 (상품 페이지에서 호출)
function addToCart(productId, quantity = 1) {
    cart.addItem(productId, quantity);
}

// 주문하기
function proceedToCheckout() {
    if (cart.items.length === 0) {
        alert('장바구니가 비어있습니다!');
        return;
    }
    window.location.href = '/order';
}

// DOM 로드 시 장바구니 초기화
document.addEventListener('DOMContentLoaded', function() {
    cart.updateCartDisplay();
});