// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    
    // ハンバーガーメニューの制御
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // メニューリンクをクリックしたときにメニューを閉じる
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // スムーススクロール
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // スクロール時のヘッダー背景変更
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // フォーム送信処理
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームデータの取得
            const formData = new FormData(this);
            const formObject = {};
            
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            
            // バリデーション
            if (validateForm(formObject)) {
                // 送信処理（実際の実装では適切なエンドポイントに送信）
                showMessage('お問い合わせを受け付けました。担当者より3営業日以内にご連絡いたします。', 'success');
                this.reset();
            }
        });
    }
    
    // フォームバリデーション
    function validateForm(data) {
        const errors = [];
        
        if (!data.company || data.company.trim() === '') {
            errors.push('会社名を入力してください。');
        }
        
        if (!data.name || data.name.trim() === '') {
            errors.push('お名前を入力してください。');
        }
        
        if (!data.email || data.email.trim() === '') {
            errors.push('メールアドレスを入力してください。');
        } else if (!isValidEmail(data.email)) {
            errors.push('正しいメールアドレスを入力してください。');
        }
        
        if (!data['inquiry-type'] || data['inquiry-type'] === '') {
            errors.push('お問い合わせ種別を選択してください。');
        }
        
        if (!data.privacy) {
            errors.push('個人情報の取扱いについて同意してください。');
        }
        
        if (errors.length > 0) {
            showMessage(errors.join('\n'), 'error');
            return false;
        }
        
        return true;
    }
    
    // メールアドレスの形式チェック
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // メッセージ表示
    function showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // メッセージ要素を作成
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 6px;
            font-weight: 500;
            ${type === 'success' 
                ? 'background: #f0fff4; color: #22543d; border: 1px solid #9ae6b4;' 
                : 'background: #fed7d7; color: #742a2a; border: 1px solid #feb2b2;'
            }
        `;
        messageDiv.textContent = message;
        
        // フォームの前に挿入
        const form = document.querySelector('.contact-form');
        form.parentNode.insertBefore(messageDiv, form);
        
        // 5秒後に自動削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
        
        // メッセージ位置にスクロール
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // アニメーション効果（スクロール時に要素を表示）
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素を監視
    const animateElements = document.querySelectorAll('.problem-item, .reason-item, .testimonial-item, .flow-step, .feature');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // 数値カウントアップアニメーション（将来的な拡張用）
    function countUp(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCount() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
            }
        }
        
        updateCount();
    }
    
    // ページトップへ戻るボタン（将来的な拡張用）
    function createBackToTopButton() {
        const button = document.createElement('button');
        button.innerHTML = '↑';
        button.className = 'back-to-top';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #2c5aa0;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
        `;
        
        button.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                button.style.opacity = '1';
            } else {
                button.style.opacity = '0';
            }
        });
        
        document.body.appendChild(button);
    }
    
    // 初期化
    createBackToTopButton();
});

// CSS アニメーション用のスタイルを動的に追加
const style = document.createElement('style');
style.textContent = `
    .problem-item,
    .reason-item,
    .testimonial-item,
    .flow-step,
    .feature {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .problem-item.animate-in,
    .reason-item.animate-in,
    .testimonial-item.animate-in,
    .flow-step.animate-in,
    .feature.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 80px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 80px);
            background: white;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 2rem;
            transition: left 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu li {
            margin: 1rem 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
    
    .back-to-top:hover {
        background: #1e3f73 !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style); 