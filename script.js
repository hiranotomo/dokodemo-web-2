// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    
    // ハンバーガーメニューの制御（キーボード対応）
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        // クリックイベント
        hamburger.addEventListener('click', function() {
            toggleMenu();
        });
        
        // キーボードイベント（Enter、Space）
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        
        // Escapeキーでメニューを閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                toggleMenu();
                hamburger.focus(); // フォーカスをハンバーガーボタンに戻す
            }
        });
        
        function toggleMenu() {
            const isOpen = navMenu.classList.contains('active');
            
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // aria-expanded属性を更新
            hamburger.setAttribute('aria-expanded', !isOpen);
            
            // aria-labelを更新
            hamburger.setAttribute('aria-label', !isOpen ? 'メニューを閉じる' : 'メニューを開く');
            
            // メニューが開いた時の処理
            if (!isOpen) {
                // 最初のメニュー項目にフォーカス
                const firstMenuItem = navMenu.querySelector('a');
                if (firstMenuItem) {
                    firstMenuItem.focus();
                }
            }
        }
        
        // メニュー内でのTab移動制御
        navMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const menuItems = navMenu.querySelectorAll('a');
                const firstItem = menuItems[0];
                const lastItem = menuItems[menuItems.length - 1];
                
                if (e.shiftKey && document.activeElement === firstItem) {
                    e.preventDefault();
                    lastItem.focus();
                } else if (!e.shiftKey && document.activeElement === lastItem) {
                    e.preventDefault();
                    firstItem.focus();
                }
            }
        });
    }
    
    // スムーススクロール（アクセシビリティ対応）
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // prefers-reduced-motionを確認
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                targetElement.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
                
                // フォーカスを移動（スクリーンリーダー対応）
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                
                // 一時的なtabindexを削除
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 100);
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
    
    // フォームバリデーション（アクセシビリティ対応）
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        const formFields = {
            company: {
                element: contactForm.querySelector('#company'),
                errorElement: contactForm.querySelector('#company-error'),
                validate: (value) => {
                    if (!value.trim()) return '会社名を入力してください';
                    if (value.trim().length < 2) return '会社名は2文字以上で入力してください';
                    return '';
                }
            },
            name: {
                element: contactForm.querySelector('#name'),
                errorElement: contactForm.querySelector('#name-error'),
                validate: (value) => {
                    if (!value.trim()) return 'お名前を入力してください';
                    if (value.trim().length < 2) return 'お名前は2文字以上で入力してください';
                    return '';
                }
            },
            email: {
                element: contactForm.querySelector('#email'),
                errorElement: contactForm.querySelector('#email-error'),
                validate: (value) => {
                    if (!value.trim()) return 'メールアドレスを入力してください';
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) return '正しいメールアドレスを入力してください';
                    return '';
                }
            },
            'inquiry-type': {
                element: contactForm.querySelector('#inquiry-type'),
                errorElement: contactForm.querySelector('#inquiry-type-error'),
                validate: (value) => {
                    if (!value) return 'お問い合わせ種別を選択してください';
                    return '';
                }
            },
            privacy: {
                element: contactForm.querySelector('input[name="privacy"]'),
                errorElement: contactForm.querySelector('#privacy-error'),
                validate: (checked) => {
                    if (!checked) return '個人情報の取扱いについて同意してください';
                    return '';
                }
            }
        };

        // リアルタイムバリデーション
        Object.keys(formFields).forEach(fieldName => {
            const field = formFields[fieldName];
            
            if (field.element) {
                const eventType = field.element.type === 'checkbox' ? 'change' : 'blur';
                
                field.element.addEventListener(eventType, function() {
                    validateField(fieldName);
                });
                
                // 入力中のエラークリア（テキストフィールドのみ）
                if (field.element.type === 'text' || field.element.type === 'email') {
                    field.element.addEventListener('input', function() {
                        if (field.errorElement.textContent) {
                            clearFieldError(fieldName);
                        }
                    });
                }
            }
        });

        function validateField(fieldName) {
            const field = formFields[fieldName];
            if (!field || !field.element) return true;

            const value = field.element.type === 'checkbox' ? field.element.checked : field.element.value;
            const errorMessage = field.validate(value);

            if (errorMessage) {
                showFieldError(fieldName, errorMessage);
                return false;
            } else {
                clearFieldError(fieldName);
                return true;
            }
        }

        function showFieldError(fieldName, message) {
            const field = formFields[fieldName];
            if (field.errorElement) {
                field.errorElement.textContent = message;
                field.element.setAttribute('aria-invalid', 'true');
                field.element.setAttribute('aria-describedby', field.errorElement.id);
            }
        }

        function clearFieldError(fieldName) {
            const field = formFields[fieldName];
            if (field.errorElement) {
                field.errorElement.textContent = '';
                field.element.setAttribute('aria-invalid', 'false');
            }
        }

        // フォーム送信処理
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // 全フィールドをバリデーション
            Object.keys(formFields).forEach(fieldName => {
                if (!validateField(fieldName)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // フォーム送信処理（実際の送信ロジックをここに実装）
                showSuccessMessage();
                contactForm.reset();
                
                // エラーメッセージをクリア
                Object.keys(formFields).forEach(fieldName => {
                    clearFieldError(fieldName);
                });
            } else {
                // 最初のエラーフィールドにフォーカス
                const firstErrorField = Object.keys(formFields).find(fieldName => {
                    const field = formFields[fieldName];
                    return field.errorElement && field.errorElement.textContent;
                });
                
                if (firstErrorField) {
                    formFields[firstErrorField].element.focus();
                }
            }
        });

        function showSuccessMessage() {
            // 成功メッセージを表示（アクセシブルな方法で）
            const successMessage = document.createElement('div');
            successMessage.setAttribute('role', 'alert');
            successMessage.setAttribute('aria-live', 'polite');
            successMessage.className = 'success-message';
            successMessage.textContent = 'お問い合わせを送信しました。ありがとうございます。';
            
            contactForm.insertBefore(successMessage, contactForm.firstChild);
            
            // 3秒後にメッセージを削除
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage);
                }
            }, 3000);
        }
    }
    
    // アニメーション効果（スクロール時に要素を表示）
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        // prefers-reduced-motionを確認
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return; // アニメーションを無効化
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素を監視
    const animateElements = document.querySelectorAll('.problem-item, .service-card, .reason-item, .testimonial-card, .flow-step, .feature');
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
    .flow-step {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card .feature {
        opacity: 1;
        transform: translateY(0);
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