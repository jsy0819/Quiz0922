// Memory Treasures - 누렁이 기억 토해내기 시뮬레이터
class MemorySimulator {
    constructor() {
        this.nuryeongStatus = {
            hunger: 75,
            digestion: 30,
            mood: 'hungry',
            energy: 80
        };
        
        this.isVomiting = false;
        this.cooldownTime = 0;
        
        this.initializeSimulator();
    }

    // 시뮬레이터 초기화
    initializeSimulator() {
        this.updateStatusDisplay();
        this.startStatusUpdates();
        this.setupEventListeners();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 먹이주기 버튼들
        const feedButtons = document.querySelectorAll('.feed-btn');
        feedButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const memoryType = e.target.dataset.memory;
                this.feedMemory(memoryType);
            });
        });

        // 토해내기 버튼
        const vomitBtn = document.getElementById('vomit-btn');
        if (vomitBtn) {
            vomitBtn.addEventListener('click', () => this.triggerVomit());
        }
    }

    // 기억 먹이기
    feedMemory(memoryType) {
        if (this.nuryeongStatus.hunger <= 10) {
            this.showNuryeongSpeech("우워... 너무 배불러... 좀 토해내고 먹을래...");
            return;
        }

        const memoryEffects = {
            childhood: { hunger: -20, mood: 'happy', energy: +10 },
            friendship: { hunger: -15, mood: 'excited', energy: +5 },
            love: { hunger: -25, mood: 'romantic', energy: +15 },
            adventure: { hunger: -22, mood: 'adventurous', energy: +12 }
        };

        const effect = memoryEffects[memoryType];
        if (effect) {
            this.nuryeongStatus.hunger = Math.max(0, this.nuryeongStatus.hunger + effect.hunger);
            this.nuryeongStatus.mood = effect.mood;
            this.nuryeongStatus.energy = Math.min(100, this.nuryeongStatus.energy + effect.energy);
            this.nuryeongStatus.digestion = Math.min(100, this.nuryeongStatus.digestion + 20);

            this.updateStatusDisplay();
            this.showFeedingAnimation(memoryType);
            this.showNuryeongSpeech(`우워! 맛있는 ${this.getMemoryTypeName(memoryType)} 기억이야! 고마워!`);
        }
    }

    // 기억 타입 한글 이름
    getMemoryTypeName(type) {
        const names = {
            childhood: '어린시절',
            friendship: '우정',
            love: '사랑',
            adventure: '모험'
        };
        return names[type] || type;
    }

    // 토해내기 실행
    async triggerVomit() {
        if (this.isVomiting) return;
        if (this.cooldownTime > 0) {
            this.showNuryeongSpeech(`우워... ${this.cooldownTime}초 더 기다려...`);
            return;
        }

        if (this.nuryeongStatus.digestion < 50) {
            this.showNuryeongSpeech("우워... 아직 소화가 안 됐어... 좀 더 기다려...");
            return;
        }

        this.isVomiting = true;
        this.updateVomitButton();
        
        // 토해내기 애니메이션
        this.showVomitAnimation();
        
        // 누렁이 상태 변화
        this.nuryeongStatus.digestion = Math.max(0, this.nuryeongStatus.digestion - 40);
        this.nuryeongStatus.hunger = Math.min(100, this.nuryeongStatus.hunger + 30);
        
        try {
            // 서버에 토해내기 요청
            const response = await fetch('/api/simulator/vomit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    hungerLevel: this.nuryeongStatus.hunger,
                    digestionLevel: this.nuryeongStatus.digestion,
                    mood: this.nuryeongStatus.mood
                })
            });
            
            const result = await response.json();
            
            setTimeout(() => {
                this.showVomitResults(result.products || []);
                this.isVomiting = false;
                this.startCooldown();
                this.updateVomitButton();
                this.updateStatusDisplay();
            }, 3000);
            
        } catch (error) {
            console.error('토해내기 실패:', error);
            // 목업 결과 생성
            setTimeout(() => {
                const mockResults = this.generateMockVomitResults();
                this.showVomitResults(mockResults);
                this.isVomiting = false;
                this.startCooldown();
                this.updateVomitButton();
                this.updateStatusDisplay();
            }, 3000);
        }
    }

    // 목업 토해내기 결과 생성
    generateMockVomitResults() {
        const possibleResults = [
            { name: '토심이의 비밀 일기', type: 'childhood', rarity: 8, price: 45000 },
            { name: '와플곰의 실험 도구', type: 'experiment', rarity: 6, price: 32000 },
            { name: '탱고의 모험 나침반', type: 'adventure', rarity: 9, price: 78000 },
            { name: '바쁘개의 업무 수첩', type: 'work', rarity: 4, price: 23000 }
        ];

        const resultCount = Math.floor(Math.random() * 3) + 1;
        const results = [];

        for (let i = 0; i < resultCount; i++) {
            const randomProduct = possibleResults[Math.floor(Math.random() * possibleResults.length)];
            results.push({
                ...randomProduct,
                id: Date.now() + i
            });
        }

        return results;
    }

    // 토해내기 결과 표시
    showVomitResults(products) {
        const resultsContainer = document.getElementById('vomit-results');
        const resultsGrid = document.getElementById('results-grid');
        const resultCount = document.getElementById('result-count');
        
        if (!resultsContainer || !resultsGrid) return;

        if (products.length === 0) {
            this.showNuryeongSpeech("우워... 오늘은 아무것도 안 나왔어... 기분이 안 좋나봐...");
            return;
        }

        resultCount.textContent = products.length;
        
        resultsGrid.innerHTML = products.map(product => `
            <div class="col-md-4 mb-3">
                <div class="card border-primary">
                    <div class="card-body text-center">
                        <div style="font-size: 3rem;">${this.getTypeIcon(product.type)}</div>
                        <h6 class="card-title">${product.name}</h6>
                        <span class="badge bg-primary">희귀도 ${product.rarity}/10</span>
                        <p class="text-primary mt-2">${product.price.toLocaleString()}원</p>
                        <button class="btn btn-sm btn-primary" onclick="addToCart('${product.id}')">
                            장바구니 담기
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        this.showNuryeongSpeech(`우워! ${products.length}개의 기억을 토해냈어! 잘 간직해줘!`);
    }

    // 타입별 아이콘
    getTypeIcon(type) {
        const icons = {
            childhood: '🧸',
            friendship: '👫', 
            love: '💕',
            adventure: '🗺️',
            experiment: '🧪',
            work: '💼'
        };
        return icons[type] || '🎁';
    }

    // 쿨다운 시작
    startCooldown() {
        this.cooldownTime = 30; // 30초 쿨다운
        
        const interval = setInterval(() => {
            this.cooldownTime--;
            this.updateCooldownDisplay();
            
            if (this.cooldownTime <= 0) {
                clearInterval(interval);
                this.updateVomitButton();
            }
        }, 1000);
    }

    // 상태 표시 업데이트
    updateStatusDisplay() {
        // 배고픔 바
        const hungerBar = document.getElementById('hunger-bar');
        if (hungerBar) {
            hungerBar.style.width = this.nuryeongStatus.hunger + '%';
            hungerBar.className = `progress-bar ${this.getHungerColor(this.nuryeongStatus.hunger)}`;
        }

        // 소화 바
        const digestionBar = document.getElementById('digestion-bar');
        if (digestionBar) {
            digestionBar.style.width = this.nuryeongStatus.digestion + '%';
        }

        // 기분 표시
        const moodDisplay = document.getElementById('mood-display');
        if (moodDisplay) {
            moodDisplay.textContent = this.getMoodText(this.nuryeongStatus.mood);
        }

        // 누렁이 얼굴 표정
        this.updateNuryeongFace();
    }

    // 배고픔 색상
    getHungerColor(hunger) {
        if (hunger > 70) return 'bg-danger';
        if (hunger > 40) return 'bg-warning';
        return 'bg-success';
    }

    // 기분 텍스트
    getMoodText(mood) {
        const moods = {
            hungry: '😋 배고픔',
            happy: '😊 행복',
            excited: '🤗 신남',
            romantic: '😍 황홀',
            adventurous: '⚡ 모험심',
            tired: '😴 피곤'
        };
        return moods[mood] || '😐 보통';
    }

    // 누렁이 얼굴 표정 업데이트
    updateNuryeongFace() {
        const avatar = document.getElementById('nuryeong-avatar');
        if (avatar) {
            if (this.nuryeongStatus.hunger > 80) {
                avatar.textContent = '🐕💭'; // 배고픔
            } else if (this.nuryeongStatus.mood === 'happy') {
                avatar.textContent = '🐕😊'; // 행복
            } else {
                avatar.textContent = '🐕';    // 기본
            }
        }
    }

    // 토해내기 버튼 상태 업데이트
    updateVomitButton() {
        const vomitBtn = document.getElementById('vomit-btn');
        if (!vomitBtn) return;

        if (this.isVomiting) {
            vomitBtn.textContent = '🤮 토해내는 중...';
            vomitBtn.disabled = true;
        } else if (this.cooldownTime > 0) {
            vomitBtn.textContent = `⏰ ${this.cooldownTime}초 대기`;
            vomitBtn.disabled = true;
        } else {
            vomitBtn.textContent = '🤮 기억 토해내기!';
            vomitBtn.disabled = false;
        }
    }

    // 쿨다운 표시 업데이트
    updateCooldownDisplay() {
        const cooldownTimer = document.getElementById('cooldown-timer');
        if (cooldownTimer) {
            if (this.cooldownTime > 0) {
                cooldownTimer.textContent = `⏰ 다음 토해내기까지: ${this.cooldownTime}초`;
                cooldownTimer.style.display = 'block';
            } else {
                cooldownTimer.style.display = 'none';
            }
        }
    }

    // 토해내기 애니메이션
    showVomitAnimation() {
        const vomitArea = document.getElementById('vomit-area');
        if (vomitArea) {
            vomitArea.innerHTML = `
                <div class="vomit-particles">
                    <div class="particle">🌟</div>
                    <div class="particle">✨</div>
                    <div class="particle">💫</div>
                    <div class="particle">🎭</div>
                    <div class="particle">🎪</div>
                </div>
            `;
            vomitArea.style.display = 'block';
            
            setTimeout(() => {
                vomitArea.style.display = 'none';
            }, 3000);
        }
    }

    // 먹이주기 애니메이션
    showFeedingAnimation(memoryType) {
        const avatar = document.getElementById('nuryeong-avatar');
        if (avatar) {
            avatar.style.transform = 'scale(1.2)';
            setTimeout(() => {
                avatar.style.transform = 'scale(1)';
            }, 300);
        }
    }

    // 누렁이 대사 표시
    showNuryeongSpeech(message) {
        const speechBubble = document.getElementById('nuryeong-speech');
        if (speechBubble) {
            speechBubble.textContent = message;
            speechBubble.style.opacity = '1';
            
            setTimeout(() => {
                speechBubble.style.opacity = '0.7';
            }, 3000);
        }
    }

    // 주기적 상태 업데이트
    startStatusUpdates() {
        setInterval(() => {
            // 자연스러운 상태 변화
            this.nuryeongStatus.hunger = Math.min(100, this.nuryeongStatus.hunger + 0.5);
            this.nuryeongStatus.digestion = Math.max(0, this.nuryeongStatus.digestion - 0.2);
            
            // 배고픔이 높으면 기분 변화
            if (this.nuryeongStatus.hunger > 90) {
                this.nuryeongStatus.mood = 'hungry';
            }
            
            this.updateStatusDisplay();
        }, 5000); // 5초마다 업데이트
    }

    // 결과 지우기
    clearResults() {
        const resultsContainer = document.getElementById('vomit-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }
}

// 전역 시뮬레이터 인스턴스
const memorySimulator = new MemorySimulator();

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: absolute;
            font-size: 2rem;
            animation: float-up 3s ease-out forwards;
        }
        
        @keyframes float-up {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-100px); }
        }
        
        .vomit-particles {
            position: relative;
            height: 100px;
        }
        
        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 30%; animation-delay: 0.5s; }
        .particle:nth-child(3) { left: 50%; animation-delay: 1s; }
        .particle:nth-child(4) { left: 70%; animation-delay: 1.5s; }
        .particle:nth-child(5) { left: 90%; animation-delay: 2s; }
    `;
    document.head.appendChild(style);
});