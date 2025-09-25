// Memory Treasures - Main JavaScript Functions
class MemoryTreasures {
    constructor() {
        this.apiBase = '/api';
        this.cart = JSON.parse(localStorage.getItem('memoryCart') || '[]');
        this.user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.websocket = null;
        
        this.init();
    }
    
    init() {
        this.updateCartCount();
        this.initWebSocket();
        this.loadUserInfo();
        
        // 전역 이벤트 리스너
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        window.addEventListener('beforeunload', this.saveCartToLocal.bind(this));
    }
    
    // WebSocket 연결
    initWebSocket() {
        if (typeof SockJS === 'undefined') return;
        
        try {
            const socket = new SockJS('/ws');
            this.websocket = Stomp.over(socket);
            
            this.websocket.connect({}, (frame) => {
                console.log('Connected to WebSocket:', frame);
                
                // 새 상품 알림 구독
                this.websocket.subscribe('/topic/new-products', (message) => {
                    const data = JSON.parse(message.body);
                    this.showNewProductNotification(data);
                });
                
                // 캐릭터 상태 알림 구독
                this.websocket.subscribe('/topic/character-status', (message) => {
                    const data = JSON.parse(message.body);
                    this.updateCharacterStatus(data);
                });
                
                // 토심이 기분 변화 알림
                this.websocket.subscribe('/topic/tosim-mood', (message) => {
                    const data = JSON.parse(message.body);
                    this.showTosimMoodNotification(data);
                });
            });
        } catch (error) {
            console.log('WebSocket not available, using polling instead');
            this.startPolling();
        }
    }
    
    // 폴링 방식으로 실시간 업데이트 (WebSocket 대체)
    startPolling() {
        setInterval(() => {
            this.updateLiveStatus();
        }, 30000);
    }
    
    // API 요청 헬퍼
    async apiRequest(endpoint, options = {}) {
        const url = this.apiBase + endpoint;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (this.user && this.user.token) {
            config.headers.Authorization = `Bearer ${this.user.token}`;
        }
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            
            // 인증 오류 시 로그아웃
            if (error.message.includes('401')) {
                this.logout();
            }
            
            throw error;
        }
    }
    
    // 장바구니 관리
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrls?.[0] || '',
                originalOwner: product.originalOwner,
                magicalPower: product.magicalPower,
                quantity: quantity,
                maxStock: product.stock
            });
        }
        
        this.saveCartToLocal();
        this.updateCartCount();
        
        // 캐릭터별 반응 메시지
        const messages = {
            '토심이': `🐰 토심이: "${product.name}을(를) 장바구니에 넣었어요! 기분이 좋아졌어요~"`,
            '와플곰': `🧸 와플곰: "${product.name}! 실험에 완벽한 재료네요! 안전하게 다뤄주세요!"`,
            '탱고': `🐱 탱고: "${product.name}은(는) 모험에 도움이 될 거예요! 좋은 선택이야!"`,
            '누렁이': `🐕 누렁이: "${product.name}... 그 기억 맛있었는데... 잘 간직해줘!"`,
            '바쁘개': `🐕‍🦺 바쁘개: "${product.name} 품질 검증 완료! 업무 효율성 증대 예상!"`,
            '급하냥': `🐱 급하냥: "${product.name}! 빨리빨리 결제하세요! 좋은 기억이에요!"`
        };
        
        const message = messages[product.originalOwner] || 
                        `${product.name}이(가) 장바구니에 추가되었습니다!`;
        
        this.showToast(message, 'success');
        
        // 장바구니 애니메이션
        this.animateCartIcon();
    }
    
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            
            this.saveCartToLocal();
            this.updateCartCount();
            
            this.showToast(`${item.name}이(가) 장바구니에서 제거되었습니다.`, 'info');
        }
    }
    
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else if (quantity <= item.maxStock) {
                item.quantity = quantity;
                this.saveCartToLocal();
                this.updateCartCount();
            } else {
                this.showToast(`재고가 ${item.maxStock}개 남았습니다.`, 'warning');
            }
        }
    }
    
    clearCart() {
        this.cart = [];
        this.saveCartToLocal();
        this.updateCartCount();
        this.showToast('장바구니가 비워졌습니다.', 'info');
    }
    
    saveCartToLocal() {
        localStorage.setItem('memoryCart', JSON.stringify(this.cart));
    }
    
    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const countElements = document.querySelectorAll('.cart-count, #cart-count');
        
        countElements.forEach(element => {
            element.textContent = count;
            
            if (count > 0) {
                element.style.display = 'inline';
                element.classList.add('bounce');
                setTimeout(() => element.classList.remove('bounce'), 500);
            } else {
                element.style.display = 'none';
            }
        });
    }
    
    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('cart-animation');
            setTimeout(() => cartIcon.classList.remove('cart-animation'), 600);
        }
    }
    
    // 상품 관련 함수들
    async loadFeaturedProducts() {
        try {
            const products = await this.apiRequest('/products/featured');
            this.renderProducts(products, 'featuredProducts');
        } catch (error) {
            console.error('Failed to load featured products:', error);
            this.showMockFeaturedProducts();
        }
    }
    
    showMockFeaturedProducts() {
        const mockProducts = [
            {
                id: 1,
                name: '토심이의 첫 일기장',
                description: '어린 시절의 순수한 감정이 담긴 소중한 일기장',
                price: 45000,
                stock: 1,
                originalOwner: '토심이',
                magicalPower: '마음을 편안하게 해주는 능력',
                emotionLevel: 9,
                rarityScore: 8,
                memoryType: 'CHILDHOOD',
                imageUrls: []
            },
            {
                id: 2,
                name: '와플곰의 실험 비커',
                description: '수많은 실험을 거친 마법의 비커',
                price: 32000,
                stock: 3,
                originalOwner: '와플곰',
                magicalPower: '액체를 맛있게 만드는 능력',
                emotionLevel: 6,
                rarityScore: 7,
                memoryType: 'EXPERIMENT',
                imageUrls: []
            },
            {
                id: 3,
                name: '탱고의 모험 나침반',
                description: '차원을 넘나드는 모험에서 사용된 나침반',
                price: 78000,
                stock: 1,
                originalOwner: '탱고',
                magicalPower: '길을 잃지 않게 해주는 능력',
                emotionLevel: 8,
                rarityScore: 10,
                memoryType: 'ADVENTURE',
                imageUrls: []
            }
        ];
        
        this.renderProducts(mockProducts, 'featuredProducts');
    }
    
    renderProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">😅</div>
                    <h3>아직 기억이 없네요...</h3>
                    <p>누렁이에게 기억을 토해내달라고 부탁해보세요!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }
    
    createProductCard(product) {
        const rarityColor = this.getRarityColor(product.rarityScore);
        const emotionEmoji = this.getEmotionEmoji(product.emotionLevel);
        const memoryIcon = this.getMemoryTypeIcon(product.memoryType);
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.imageUrls && product.imageUrls.length > 0 ? 
                        `<img src="${product.imageUrls[0]}" alt="${product.name}">` :
                        `<div class="no-image"><span class="memory-icon">${memoryIcon}</span></div>`
                    }
                    <div class="rarity-badge" style="background-color: ${rarityColor}">
                        희귀도 ${product.rarityScore}/10
                    </div>
                </div>
                
                <div class="product-info">
                    <div class="product-owner">
                        <span class="owner-tag">${product.originalOwner}의 기억</span>
                    </div>
                    
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="emotion-level">
                        <span class="emotion-emoji">${emotionEmoji}</span>
                        <span class="emotion-text">감정 강도: ${product.emotionLevel}/10</span>
                    </div>
                    
                    ${product.magicalPower ? `
                        <div class="magical-power">
                            <span class="magic-icon">✨</span>
                            <span class="power-text">${product.magicalPower}</span>
                        </div>
                    ` : ''}
                    
                    <div class="product-price">
                        ${product.price.toLocaleString()}원
                    </div>
                    
                    <div class="stock-info">
                        ${product.stock > 0 ? 
                            `<span class="in-stock">재고 ${product.stock}개</span>` :
                            `<span class="out-of-stock">품절</span>`
                        }
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" 
                                onclick="memoryTreasures.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock > 0 ? '장바구니에 담기' : '품절'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getRarityColor(score) {
        if (score >= 9) return '#ff6b6b'; // 전설
        if (score >= 7) return '#4ecdc4'; // 희귀  
        if (score >= 5) return '#45b7d1'; // 고급
        return '#96ceb4'; // 일반
    }
    
    getEmotionEmoji(level) {
        if (level >= 8) return '✨💖';
        if (level >= 6) return '😊💫';
        if (level >= 4) return '🙂⭐';
        return '😐';
    }
    
    getMemoryTypeIcon(type) {
        const icons = {
            'CHILDHOOD': '🧸',
            'FRIENDSHIP': '👫',
            'LOVE': '💕',
            'ADVENTURE': '🗺️',
            'ACHIEVEMENT': '🏆',
            'FOOD': '🍰',
            'TOY': '🎮',
            'EXPERIMENT': '🧪'
        };
        return icons[type] || '💭';
    }
    
    // 실시간 상태 업데이트
    async updateLiveStatus() {
        try {
            const status = await this.apiRequest('/status/live');
            this.updateStatusDisplay(status);
        } catch (error) {
            console.error('Failed to update live status:', error);
            this.showMockLiveStatus();
        }
    }
    
    showMockLiveStatus() {
        const mockStatus = {
            nuryeongMood: this.getRandomNuryeongMood(),
            tangoStatus: this.getRandomTangoStatus(),
            dailyVomitCount: Math.floor(Math.random() * 50) + 20,
            totalProducts: Math.floor(Math.random() * 100) + 200,
            newProducts: Math.floor(Math.random() * 20) + 5
        };
        
        this.updateStatusDisplay(mockStatus);
    }
    
    getRandomNuryeongMood() {
        const moods = [
            { text: '배고픔 😋', color: '#ff6b6b' },
            { text: '소화중 😵', color: '#ffa726' },
            { text: '배부름 😴', color: '#66bb6a' },
            { text: '행복 🤗', color: '#42a5f5' }
        ];
        return moods[Math.floor(Math.random() * moods.length)];
    }
    
    getRandomTangoStatus() {
        const statuses = [
            '모험 중 ⚡',
            '차원 탐사 🌌',
            '휴식 중 😊',
            '시공간 정리 🔧'
        ];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    updateStatusDisplay(status) {
        // 누렁이 상태
        const nuryeongMood = document.getElementById('nuryeongMood');
        if (nuryeongMood && status.nuryeongMood) {
            nuryeongMood.textContent = status.nuryeongMood.text || status.nuryeongMood;
            if (status.nuryeongMood.color) {
                nuryeongMood.style.color = status.nuryeongMood.color;
            }
        }
        
        // 탱고 상태
        const tangoStatus = document.getElementById('tangoStatus');
        if (tangoStatus && status.tangoStatus) {
            tangoStatus.textContent = status.tangoStatus;
        }
        
        // 통계 업데이트
        this.updateElement('dailyVomitCount', status.dailyVomitCount + '개');
        this.updateElement('totalProducts', status.totalProducts + '개');
        this.updateElement('newProducts', status.newProducts + '개');
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.textContent = value;
        }
    }
    
    // 사용자 인증 관련
    async login(username, password) {
        try {
            const user = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            this.user = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.loadUserInfo();
            
            this.showToast(`환영합니다, ${user.nickname || user.username}님!`, 'success');
            
            return user;
        } catch (error) {
            this.showToast('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.', 'error');
            throw error;
        }
    }
    
    logout() {
        this.user = null;
        localStorage.removeItem('currentUser');
        this.loadUserInfo();
        this.showToast('로그아웃되었습니다.', 'info');
        
        // 홈페이지로 이동
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
    }
    
    loadUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const username = document.getElementById('username');
        
        if (this.user) {
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';
            if (username) username.textContent = this.user.nickname || this.user.username;
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
        }
    }
    
    checkUserLogin() {
        this.loadUserInfo();
        return this.user !== null;
    }
    
    // 알림 시스템
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                ${this.getToastIcon(type)} ${message}
            </div>
        `;
        
        container.appendChild(toast);
        
        // 자동 제거
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-in';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        // 클릭으로 제거
        toast.addEventListener('click', () => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        });
    }
    
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    getToastIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    // 캐릭터 정보 모달
    showCharacterInfo(characterType) {
        const characterData = {
            nuryeong: {
                name: '누렁이',
                avatar: '🐕',
                description: '기억을 먹는 우주적 존재',
                story: `원래는 평범한 강아지였지만, 어느 날 우주의 기억 구슬을 먹게 되면서 특별한 능력을 얻었어요. 
                       이제 모든 기억을 먹을 수 있고, 먹은 기억들을 물건으로 토해낼 수 있답니다. 
                       하지만 가끔 소화가 잘 안 되서 고생하고 있어요.`,
                abilities: [
                    '기억 섭취 능력',
                    '기억 물질화 (토해내기)',
                    '감정 감지 능력',
                    '시공간 기억 저장'
                ],
                mood: '오늘은 배고파요 😋',
                quote: '"우워! 맛있는 기억 있으면 주세요!"'
            },
            tango: {
                name: '탱고',
                avatar: '🐱',
                description: '시공간 오류 해결사',
                story: `차원을 넘나드는 모험가로, 시공간의 오류를 해결하는 것이 주 임무예요. 
                       누렁이의 기억 토해내기 현상을 발견하고 함께 잡화점을 운영하기로 했어요. 
                       가끔 포악해질 수 있지만 본성은 착한 고양이랍니다.`,
                abilities: [
                    '시공간 이동',
                    '차원 탐사',
                    '오류 수정 능력',
                    '모험가의 직감'
                ],
                mood: '모험 중이에요 ⚡',
                quote: '"새로운 모험이 시작되는군! 함께 가자!"'
            }
        };
        
        const character = characterData[characterType];
        if (!character) return;
        
        const modal = document.getElementById('characterModal');
        const characterInfo = document.getElementById('characterInfo');
        
        if (modal && characterInfo) {
            characterInfo.innerHTML = `
                <div class="character-modal-content">
                    <div class="character-header">
                        <div class="character-avatar-large">${character.avatar}</div>
                        <h2>${character.name}</h2>
                        <p class="character-title">${character.description}</p>
                    </div>
                    
                    <div class="character-story">
                        <h3>📖 이야기</h3>
                        <p>${character.story}</p>
                    </div>
                    
                    <div class="character-abilities">
                        <h3>✨ 특별한 능력</h3>
                        <ul>
                            ${character.abilities.map(ability => `<li>${ability}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="character-status">
                        <div class="status-item">
                            <strong>현재 상태:</strong> ${character.mood}
                        </div>
                        <div class="character-quote">
                            ${character.quote}
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }
    
    closeCharacterModal() {
        const modal = document.getElementById('characterModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // 카테고리 이동
    viewCategory(categoryType) {
        window.location.href = `products.html?category=${categoryType}`;
    }
    
    // 전역 클릭 이벤트 처리
    handleGlobalClick(event) {
        // 모달 외부 클릭 시 닫기
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
    
    // 알림 처리
    showNewProductNotification(data) {
        this.showToast(`🐕 누렁이가 ${data.count}개의 새로운 기억을 토해냈어요!`, 'success', 6000);
        
        // 실시간 상태 업데이트
        this.updateLiveStatus();
    }
    
    showTosimMoodNotification(data) {
        const moodEmojis = {
            '좋음': '😊',
            '보통': '😐',
            '나쁨': '😢',
            '매우좋음': '🤗',
            '화남': '😡'
        };
        
        const emoji = moodEmojis[data.mood] || '🐰';
        this.showToast(`${emoji} 토심이의 기분이 ${data.mood}(으)로 바뀌었어요!`, 'info', 5000);
    }
    
    updateCharacterStatus(data) {
        // 캐릭터 상태 실시간 업데이트
        if (data.character === 'nuryeong') {
            this.updateElement('nuryeongMood', data.status);
        } else if (data.character === 'tango') {
            this.updateElement('tangoStatus', data.status);
        }
    }
}

// 전역 함수들 (HTML에서 직접 호출)
function showCharacterInfo(characterType) {
    memoryTreasures.showCharacterInfo(characterType);
}

function closeCharacterModal() {
    memoryTreasures.closeCharacterModal();
}

function viewCategory(categoryType) {
    memoryTreasures.viewCategory(categoryType);
}

function logout() {
    memoryTreasures.logout();
}

function continueShopping() {
    window.location.href = 'products.html';
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 전역 인스턴스 생성
    window.memoryTreasures = new MemoryTreasures();
});

// CSS 애니메이션 추가
const additionalCSS = `
@keyframes toastSlideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

@keyframes cart-animation {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.cart-animation {
    animation: cart-animation 0.6s ease-in-out;
}

.character-modal-content {
    padding: 1rem 0;
}

.character-header {
    text-align: center;
    margin-bottom: 2rem;
}

.character-avatar-large {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: wiggle 3s ease-in-out infinite;
}

.character-title {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-top: 0.5rem;
}

.character-story,
.character-abilities,
.character-status {
    margin-bottom: 2rem;
}

.character-story h3,
.character-abilities h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.character-abilities ul {
    list-style: none;
    padding: 0;
}

.character-abilities li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.character-abilities li:before {
    content: '✨ ';
    color: var(--primary-color);
}

.character-quote {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: var(--radius-medium);
    font-style: italic;
    margin-top: 1rem;
    border-left: 4px solid var(--primary-color);
}

.status-item {
    margin-bottom: 0.5rem;
}
`;

// 동적 스타일 추가
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}