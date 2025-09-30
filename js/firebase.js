// Firebase 配置和初始化
let db, auth, googleProvider;

function initializeFirebase() {
    console.log('页面加载完成');
    console.log('Firebase config:', firebaseConfig);
    
    // 验证Firebase配置
    if (typeof validateFirebaseConfig === 'function' && !validateFirebaseConfig()) {
        console.error('Firebase配置验证失败，无法初始化');
        return false;
    }
    
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase 初始化成功');
    } catch (error) {
        console.error('Firebase 初始化失败:', error);
        // 显示用户友好的错误信息
        if (error.code === 'auth/invalid-api-key') {
            console.error('API密钥无效，请检查环境变量配置');
        }
        return false;
    }
    
    db = firebase.firestore();
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    
    console.log('Firebase 服务初始化完成');
    return true;
}

// 数据管理函数
async function loadData(userId) {
    const docRef = db.collection('users').doc(userId);
    const doc = await docRef.get();
    if (doc.exists) {
        return doc.data();
    } else {
        const defaultData = {
            boards: {
                startup: { title: "创业", color: "purple", projects: [] },
                finance: { title: "财务", color: "blue", projects: [] },
                learning: { title: "学习", color: "indigo", projects: [] },
                health: { title: "健康", color: "rose", projects: [] },
                misc: { title: "其他", color: "amber", projects: [] },
            },
            events: [], 
            taskCompletions: {} 
        };
        await saveData(userId, defaultData);
        return defaultData;
    }
}

async function saveData(userId, appData) {
    if (!userId) return;
    const docRef = db.collection('users').doc(userId);
    await docRef.set(appData);
}

// 导出函数供其他模块使用
window.firebaseUtils = {
    initializeFirebase,
    loadData,
    saveData,
    getDb: () => db,
    getAuth: () => auth,
    getGoogleProvider: () => googleProvider
};
