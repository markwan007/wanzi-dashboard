// 主应用逻辑
let appData;

// 核心渲染逻辑
function renderAll() {
    if (!appData) return;
    window.calendarModule.renderCalendar();
    window.calendarModule.renderAgenda();
    window.projectsModule.renderAllBoards();
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
        if(e.target.classList.contains('project-tab')) {
            const { tab, projectId } = e.target.dataset;
            const projectCard = e.target.closest('.glass-pane');
            projectCard.querySelectorAll('.project-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            projectCard.querySelectorAll('.project-tab-content').forEach(c => c.classList.add('hidden'));
            projectCard.querySelector(`[data-tab-content="${tab}"][data-project-id="${projectId}"]`).classList.remove('hidden');
        }
    });

    // 表单提交
    document.getElementById('main-content').addEventListener('submit', async (e) => {
        if (e.target.classList.contains('review-form')) {
            e.preventDefault();
            const projectId = e.target.dataset.projectId;
            const boardKey = window.utils.getActiveBoardKey();
            const project = appData.boards[boardKey].projects.find(p => p.id === projectId);
            if (project) {
                if(!project.reviews) project.reviews = [];
                project.reviews.push({
                    date: window.utils.toDateString(new Date()),
                    wins: e.target.elements.wins.value,
                    challenges: e.target.elements.challenges.value,
                    learnings: e.target.elements.learnings.value,
                    nextSteps: e.target.elements.nextSteps.value
                });
                e.target.reset();
                await window.firebaseUtils.saveData(window.userId, appData);
                window.projectsModule.renderSingleBoard(boardKey);
            }
        }
    });
    
    // KPI 输入变化
    document.getElementById('main-content').addEventListener('change', async (e) => {
        if (e.target.classList.contains('kpi-input')) {
             const { projectId, kpiId } = e.target.dataset;
             const boardKey = window.utils.getActiveBoardKey();
             const project = appData.boards[boardKey].projects.find(p => p.id === projectId);
             if(project) {
                 const kpi = project.kpis.find(k => k.id === kpiId);
                 if (kpi) kpi.currentValue = parseFloat(e.target.value);
                 await window.firebaseUtils.saveData(window.userId, appData);
             }
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
