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
        if(e.target.closest('.project-edit-btn')) {
            const btn = e.target.closest('.project-edit-btn');
            const projectId = btn.dataset.projectId;
            const boardKey = window.utils.getActiveBoardKey();
            window.projectsModule.openProjectModal(boardKey, projectId);
        }
    });

    // 任务复选框变化
    document.body.addEventListener('change', e => {
        if (e.target.classList.contains('task-checkbox')) {
            window.calendarModule.toggleTaskCompletion(e.target.dataset.taskId);
        }
    });
    
    // 跳过任务按钮
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('skip-task-btn')) {
            const taskId = e.target.dataset.taskId;
            if (confirm('确定要跳过这个任务吗？明天它会重新出现。')) {
                window.calendarModule.skipTask(taskId);
            }
        }
    });

    // 设置各个模块的事件监听器
    window.calendarModule.setupCalendarEventListeners();
    window.projectsModule.setupProjectEventListeners();
    window.reviewModule.setupReviewEventListeners();
    window.projectCalendarModule.setupProjectCalendarEventListeners();
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
