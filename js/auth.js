// 认证相关功能
function initializeAuth() {
    const auth = window.firebaseUtils.getAuth();
    const googleProvider = window.firebaseUtils.getGoogleProvider();
    
    // 检查按钮是否存在
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const googleBtn = document.getElementById('google-login-btn');
    
    console.log('按钮检查:', {
        loginBtn: !!loginBtn,
        registerBtn: !!registerBtn,
        googleBtn: !!googleBtn
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', e => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => alert(`登录失败: ${error.message}`));
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', e => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            auth.createUserWithEmailAndPassword(email, password)
                .catch(error => alert(`注册失败: ${error.message}`));
        });
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            console.log('Google 登录按钮被点击');
            console.log('Firebase auth:', auth);
            console.log('Google provider:', googleProvider);
            
            auth.signInWithPopup(googleProvider)
                .then(result => {
                    console.log('Google 登录成功:', result);
                })
                .catch(error => {
                    console.error('Google 登录失败:', error);
                    alert(`Google 登录失败: ${error.message}`);
                });
        });
    } else {
        console.error('Google 登录按钮未找到');
    }
}

// 认证状态监听
function setupAuthStateListener() {
    const auth = window.firebaseUtils.getAuth();
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    auth.onAuthStateChanged(async user => {
        if (user) {
            window.userId = user.uid;
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            await window.app.loadData();
            window.app.initializeAppEventListeners();
            window.app.renderAll();
        } else {
            window.userId = null;
            appContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
        }
    });
}

// 登出功能
function setupLogout() {
    const auth = window.firebaseUtils.getAuth();
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.signOut());
    }
}

// 导出函数
window.authModule = {
    initializeAuth,
    setupAuthStateListener,
    setupLogout
};
