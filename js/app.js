// 主应用逻辑
let appData;

// 核心渲染逻辑
function renderAll() {
    if (!appData) return;
    window.calendarModule.renderCalendar();
    window.calendarModule.renderAgenda();
    window.projectsModule.renderAllBoards();
    window.projectsModule.updateAllProgressBars();
}

// 数据加载
async function loadData() {
    appData = await window.firebaseUtils.loadData(window.userId);
    window.appData = appData; // 设置全局引用
}

// 事件监听器初始化
function initializeAppEventListeners() {
    // 导航切换
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetBoardId = 'board-' + item.dataset.board;
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.board-panel').forEach(panel => panel.classList.add('hidden'));
            document.getElementById(targetBoardId).classList.remove('hidden');
            renderAll();
        });
    });

    // 主内容区事件
    document.getElementById('main-content').addEventListener('click', e => {
        if(e.target.classList.contains('add-project-btn')) {
            window.projectsModule.openProjectModal(e.target.dataset.boardKey);
        }
        if(e.target.classList.contains('board-settings-btn')) {
            window.projectsModule.openBoardSettingsModal(e.target.dataset.boardKey);
        }
    });

    // 任务复选框变化
    document.body.addEventListener('change', e => {
        if (e.target.classList.contains('task-checkbox')) {
            window.calendarModule.toggleTaskCompletion(e.target.dataset.taskId);
        }
    });

    // 设置各个模块的事件监听器
    window.calendarModule.setupCalendarEventListeners();
    window.projectsModule.setupProjectEventListeners();
    window.authModule.setupLogout();
}

// 应用初始化
function initializeApp() {
    if (!window.firebaseUtils.initializeFirebase()) {
        console.error('Firebase 初始化失败，应用无法启动');
        return;
    }

    // 初始化认证
    window.authModule.initializeAuth();
    window.authModule.setupAuthStateListener();
}

// 导出主应用
window.app = {
    renderAll,
    loadData,
    initializeAppEventListeners,
    initializeApp
};
