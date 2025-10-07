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

    // 主内容区事件（优化：合并所有点击事件到单一委托监听器）
    document.getElementById('main-content').addEventListener('click', e => {
        const target = e.target;
        
        // 添加项目按钮
        if(target.classList.contains('add-project-btn')) {
            window.projectsModule.openProjectModal(target.dataset.boardKey);
            return;
        }
        
        // 板块设置按钮（SVG子元素需要用closest）
        const settingsBtn = target.closest('.board-settings-btn');
        if(settingsBtn) {
            window.projectsModule.openBoardSettingsModal(settingsBtn.dataset.boardKey);
            return;
        }
        
        // 删除板块按钮（SVG子元素需要用closest）
        const deleteBoardBtn = target.closest('.board-delete-btn');
        if(deleteBoardBtn) {
            window.projectsModule.deleteBoard(deleteBoardBtn.dataset.boardKey);
            return;
        }
        
        // 编辑项目按钮
        const editBtn = target.closest('.project-edit-btn');
        if(editBtn) {
            const projectId = editBtn.dataset.projectId;
            const boardKey = window.utils.getActiveBoardKey();
            window.projectsModule.openProjectModal(boardKey, projectId);
            return;
        }
        
        // 删除项目按钮
        const deleteProjectBtn = target.closest('.project-delete-btn');
        if(deleteProjectBtn) {
            const projectId = deleteProjectBtn.dataset.projectId;
            const boardKey = deleteProjectBtn.dataset.boardKey;
            window.projectsModule.deleteProject(projectId, boardKey);
            return;
        }
        
        // 项目日历按钮
        const calendarBtn = target.closest('.project-calendar-btn');
        if(calendarBtn) {
            window.projectCalendarModule.openProjectCalendar(calendarBtn.dataset.projectId);
            return;
        }
        
        // 跳过任务按钮
        const skipBtn = target.closest('.skip-task-btn');
        if(skipBtn) {
            window.calendarModule.skipTask(skipBtn.dataset.taskId);
            return;
        }
    });

    // 任务复选框变化（使用change事件更合适）
    document.body.addEventListener('change', e => {
        if (e.target.classList.contains('task-checkbox')) {
            window.calendarModule.toggleTaskCompletion(e.target.dataset.taskId);
        }
    });

    // 设置各个模块的事件监听器
    window.calendarModule.setupCalendarEventListeners();
    window.projectsModule.setupProjectEventListeners();
    window.reviewModule.setupReviewEventListeners();
    window.projectCalendarModule.setupProjectCalendarEventListeners();
    initBoardShortcuts();
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

// 板块快捷入口功能
function initBoardShortcuts() {
    // 点击快捷卡片跳转到对应板块
    document.querySelectorAll('.board-shortcut-card').forEach(card => {
        card.addEventListener('click', function() {
            const boardKey = this.dataset.board;
            const navItem = document.querySelector(`.nav-item[data-board="${boardKey}"]`);
            if (navItem) {
                navItem.click();
            }
        });
    });
    
    // 更新各板块任务数量
    updateBoardTaskCounts();
}

// 更新板块任务数量显示
function updateBoardTaskCounts() {
    if (!window.appData) return;
    
    const today = new Date();
    const todayTasks = window.calendarModule.getTasksForDate(today);
    
    // 统计各板块任务数
    const counts = {
        startup: 0,
        finance: 0,
        learning: 0,
        health: 0,
        misc: 0
    };
    
    todayTasks.forEach(task => {
        if (task.boardKey && counts.hasOwnProperty(task.boardKey)) {
            counts[task.boardKey]++;
        }
    });
    
    // 更新UI
    Object.keys(counts).forEach(boardKey => {
        const countEl = document.getElementById(`${boardKey}-count`);
        if (countEl) {
            const count = counts[boardKey];
            countEl.textContent = count === 0 ? '暂无任务' : `${count}个任务`;
            countEl.style.color = count > 0 ? '#f97316' : '#94a3b8';
        }
    });
}

// 在renderAll中调用更新
const originalRenderAll = renderAll;
renderAll = function() {
    originalRenderAll();
    if (typeof updateBoardTaskCounts === 'function') {
        updateBoardTaskCounts();
    }
};
