// 项目管理相关功能
function renderAllBoards() {
    Object.keys(window.appData.boards).forEach(key => renderSingleBoard(key));
}

function renderSingleBoard(key) {
    const data = window.appData.boards[key];
    if (!data) return;
    const panel = document.getElementById(`board-${key}`);
    const colors = window.utils.colorMap[data.color];

    const projectsHTML = (data.projects || []).map(project => {
        const tasksForProjectOnDate = window.calendarModule.getTasksForDate(window.calendarModule.getViewedDate()).filter(t => t.projectId === project.id);
        const tasksHTML = tasksForProjectOnDate.map(task => {
             const isCompleted = window.calendarModule.isTaskCompletedOnDate(task.id, window.calendarModule.getViewedDate());
             
             // 备注 tooltip
             const tooltipAttr = task.notes ? `title="${window.utils.escapeHtml(task.notes)}"` : '';
             
             // 使用共享函数构建任务链接HTML（需要手动添加ml-4类）
             const linkHTMLBase = window.utils.buildTaskLinksHtml(task, 'board-task-', isCompleted, tooltipAttr);
             const linkHTML = linkHTMLBase.replace('class="task-label', 'class="task-label ml-4');
             
             // 复盘任务的日志图标
             const reviewIconHTML = task.isReview ? `
                 <button class="review-journal-btn p-1 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors ml-auto" 
                         data-task-id="${task.id}" 
                         data-project-id="${project.id}"
                         title="打开复盘日志">
                     📔
                 </button>
             ` : '';
             
             // 跳过按钮（复盘任务不显示跳过按钮）
             const skipButtonHTML = task.isReview ? '' : `
                 <button class="skip-task-btn text-gray-400 hover:text-red-500 ml-auto p-1 text-sm transition-colors" 
                         data-task-id="${task.id}" 
                         title="今天跳过此任务">
                     ✕
                 </button>
             `;
             
             // 备注显示（使用共享函数）
             const notesHTML = window.utils.buildTaskNotesHtml(task.notes, 'ml-8');
             
             return `<li class="flex flex-col">
                        <div class="flex items-center">
                            <input id="board-task-${task.id}" type="checkbox" class="custom-checkbox task-checkbox" data-task-id="${task.id}" ${isCompleted ? 'checked' : ''}>
                            ${linkHTML}
                            ${reviewIconHTML}
                            ${skipButtonHTML}
                        </div>
                        ${notesHTML}
                    </li>`
        }).join('');

        
        const reviewsHTML = (project.reviews || []).slice().reverse().map(review => `
            <div class="p-3 bg-gray-50 rounded-lg mt-2">
               <p class="font-semibold text-sm">${review.date}</p>
               <p class="text-xs mt-1"><strong>成就:</strong> ${review.wins}</p>
               <p class="text-xs"><strong>挑战:</strong> ${review.challenges}</p>
            </div>
        `).join('');

        return `
        <div class="glass-pane rounded-xl overflow-hidden glass-pane-hover border-t-4 ${colors.border} relative">
            <div class="p-6">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="text-lg font-semibold text-gray-900">${project.title}</h4>
                    <div class="flex items-center space-x-2">
                        <button class="project-edit-btn text-gray-500 hover:text-orange-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" 
                                data-project-id="${project.id}" 
                                title="编辑项目">
                            ⚙️
                        </button>
                        <button class="project-calendar-btn text-gray-500 hover:text-orange-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" 
                                data-project-id="${project.id}" 
                                title="查看项目日历">
                            📅
                        </button>
                        <button class="project-delete-btn text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors" 
                                data-project-id="${project.id}" 
                                data-board-key="${key}"
                                title="删除项目">
                            🗑️
                        </button>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mb-4">${project.startDate} 到 ${project.endDate}</p>
                

                <ul class="space-y-4 mb-6 min-h-[50px]">${tasksHTML || '<p class="text-sm text-gray-400">今天没有此项目的任务。</p>'}</ul>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="progress-bar-inner bg-gradient-to-r ${colors.gradient} h-2.5 rounded-full" data-project-id="${project.id}" style="width: 0%"></div>
                </div>
            </div>
        </div>`
    }).join('');

    panel.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <div class="flex items-center space-x-3">
                <h3 class="text-2xl font-bold text-gray-900">${data.title}</h3>
                <button class="board-settings-btn text-gray-500 hover:text-orange-600 p-2 rounded-lg hover:bg-gray-100" data-board-key="${key}" title="板块设置">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
            <div class="flex items-center space-x-3">
                <button class="board-delete-btn text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors" data-board-key="${key}" title="删除板块">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
                <button class="add-project-btn bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600" data-board-key="${key}">+ 新建项目</button>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">${projectsHTML}</div>
    `;
    // 延迟更新进度条，确保DOM已渲染
    setTimeout(() => updateAllProgressBars(), 100);
}

function updateAllProgressBars() {
    const activeBoardKey = window.utils.getActiveBoardKey();
    if(!window.appData || !window.appData.boards[activeBoardKey]) return;

    window.appData.boards[activeBoardKey].projects.forEach(project => {
        const tasksForDayInProject = window.calendarModule.getTasksForDate(window.calendarModule.getViewedDate()).filter(t => t.projectId === project.id && t.type !== 'review');
        const completedCount = tasksForDayInProject.filter(t => window.calendarModule.isTaskCompletedOnDate(t.id, window.calendarModule.getViewedDate())).length;
        const percentage = tasksForDayInProject.length > 0 ? (completedCount / tasksForDayInProject.length) * 100 : 0;
        const progressBar = document.querySelector(`.progress-bar-inner[data-project-id="${project.id}"]`);
        if(progressBar) progressBar.style.width = `${percentage}%`;
    });
}

// 项目模态框相关
const modal = document.getElementById('project-modal');
const form = document.getElementById('project-form');
let currentBoardKeyForModal;
let editingProjectId = null;  // 用于跟踪正在编辑的项目

// 板块设置模态框相关
const boardSettingsModal = document.getElementById('board-settings-modal');
const boardSettingsForm = document.getElementById('board-settings-form');
let currentBoardKeyForSettings;

function openProjectModal(boardKey, projectId = null) {
    currentBoardKeyForModal = boardKey;
    editingProjectId = projectId;
    
    // 更新模态框标题和按钮
    const modalTitle = document.getElementById('project-modal-title');
    const submitBtn = document.getElementById('submit-project-btn');
    
    if (projectId) {
        // 编辑模式
        modalTitle.textContent = '编辑项目';
        submitBtn.textContent = '保存更改';
        loadProjectData(projectId, boardKey);
    } else {
        // 创建模式
        modalTitle.textContent = '创建新项目';
        submitBtn.textContent = '创建项目';
        form.reset();
        document.getElementById('modal-tasks-container').innerHTML = '';
        addModalTaskRow();
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeProjectModal() {
     modal.classList.add('opacity-0');
     modal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
     setTimeout(() => {
         modal.classList.add('hidden');
         editingProjectId = null;  // 清除编辑状态
     }, 300);
}

// 加载项目数据到表单
function loadProjectData(projectId, boardKey) {
    const project = window.appData.boards[boardKey].projects.find(p => p.id === projectId);
    if (!project) return;
    
    // 填充基本信息
    document.getElementById('project-name').value = project.title;
    document.getElementById('start-date').value = project.startDate;
    document.getElementById('end-date').value = project.endDate;
    document.getElementById('review-day').value = project.reviewDay ?? -1;
    
    // 清空任务容器
    const tasksContainer = document.getElementById('modal-tasks-container');
    tasksContainer.innerHTML = '';
    
    // 加载任务（排除复盘任务）
    const regularTasks = (project.tasks || []).filter(task => !task.isReview);
    
    if (regularTasks.length === 0) {
        // 如果没有任务，添加一个空行
        addModalTaskRow();
    } else {
        regularTasks.forEach(task => {
            addModalTaskRow();
            const lastRow = tasksContainer.lastElementChild;
            
            // 设置任务ID到行元素
            lastRow.dataset.taskId = task.id;
            
            // 填充任务数据
            lastRow.querySelector('.modal-task-text').value = task.text;
            lastRow.querySelector('.modal-task-notes').value = task.notes || '';
            lastRow.querySelector('.modal-task-frequency').value = task.frequency || 'daily';
            lastRow.querySelector('.modal-task-time').value = task.time || '';
            
            // 加载链接
            const linksList = lastRow.querySelector('.modal-task-links-list');
            if (task.links && task.links.length > 0) {
                task.links.forEach(link => {
                    addTaskLinkRow(linksList, link.name, link.url);
                });
            } else if (task.link) {
                // 兼容旧的单链接格式
                addTaskLinkRow(linksList, '链接', task.link);
            }
            
            // 根据频率显示相应的字段
            const frequency = task.frequency || task.type || 'daily';
            const dateContainer = lastRow.querySelector('.modal-task-date-container');
            const weeklyContainer = lastRow.querySelector('.modal-task-weekly-container');
            const monthlyContainer = lastRow.querySelector('.modal-task-monthly-container');
            
            // 隐藏所有容器
            dateContainer.classList.add('hidden');
            weeklyContainer.classList.add('hidden');
            monthlyContainer.classList.add('hidden');
            
            // 根据频率显示和填充相应字段
            if (frequency === 'once') {
                dateContainer.classList.remove('hidden');
                lastRow.querySelector('.modal-task-date').value = task.date || '';
            } else if (frequency === 'weekly') {
                weeklyContainer.classList.remove('hidden');
                if (task.weekdays) {
                    task.weekdays.forEach(day => {
                        const checkbox = lastRow.querySelector(`.modal-task-weekday[value="${day}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            } else if (frequency === 'monthly') {
                monthlyContainer.classList.remove('hidden');
                lastRow.querySelector('.modal-task-monthday').value = task.monthDay || 1;
            }
        });
    }
}

// 板块设置相关函数
function openBoardSettingsModal(boardKey) {
    currentBoardKeyForSettings = boardKey;
    const boardData = window.appData.boards[boardKey];
    
    // 填充当前设置
    document.getElementById('board-title').value = boardData.title;
    
    // 设置当前颜色为选中状态
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('border-orange-500', 'ring-2', 'ring-orange-200');
        btn.classList.add('border-gray-300');
        if (btn.dataset.color === boardData.color) {
            btn.classList.remove('border-gray-300');
            btn.classList.add('border-orange-500', 'ring-2', 'ring-orange-200');
        }
    });
    
    boardSettingsModal.classList.remove('hidden');
    setTimeout(() => {
        boardSettingsModal.classList.remove('opacity-0');
        boardSettingsModal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeBoardSettingsModal() {
    boardSettingsModal.classList.add('opacity-0');
    boardSettingsModal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => boardSettingsModal.classList.add('hidden'), 300);
}

// 删除板块
async function deleteBoard(boardKey) {
    const boardData = window.appData.boards[boardKey];
    const boardTitle = boardData.title;
    const projectCount = boardData.projects?.length || 0;
    
    // 二次确认
    const confirmMessage = `⚠️ 确定要删除"${boardTitle}"板块吗？\n\n此板块包含 ${projectCount} 个项目，删除后将无法恢复！\n\n请输入板块名称 "${boardTitle}" 来确认删除：`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== boardTitle) {
        if (userInput !== null) {
            alert('❌ 输入不匹配，取消删除');
        }
        return;
    }
    
    // 删除板块
    delete window.appData.boards[boardKey];
    
    // 保存到 Firebase
    await window.firebaseUtils.saveData(window.userId, window.appData);
    
    // 显示成功提示
    showDeleteToast(`✓ "${boardTitle}" 板块已删除`);
    
    // 重新渲染整个应用
    window.app.renderAll();
}

// 显示删除提示（使用共享Toast函数）
function showDeleteToast(message) {
    window.utils.showToast(message);
}

// 删除项目
async function deleteProject(projectId, boardKey) {
    const board = window.appData.boards[boardKey];
    const project = board.projects.find(p => p.id === projectId);
    
    if (!project) return;
    
    const projectTitle = project.title;
    const taskCount = project.tasks?.length || 0;
    
    // 二次确认
    const confirmMessage = `⚠️ 确定要删除项目"${projectTitle}"吗？\n\n此项目包含 ${taskCount} 个任务，删除后将无法恢复！\n\n请输入项目名称 "${projectTitle}" 来确认删除：`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== projectTitle) {
        if (userInput !== null) {
            alert('❌ 输入不匹配，取消删除');
        }
        return;
    }
    
    // 删除项目
    board.projects = board.projects.filter(p => p.id !== projectId);
    
    // 保存到 Firebase
    await window.firebaseUtils.saveData(window.userId, window.appData);
    
    // 显示成功提示
    showDeleteToast(`✓ "${projectTitle}" 项目已删除`);
    
    // 重新渲染整个应用
    window.app.renderAll();
}


// 添加任务链接行
function addTaskLinkRow(linksList, linkName = '', linkUrl = '') {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'flex items-center space-x-2 task-link-row';
    linkDiv.innerHTML = `
        <input type="text" class="task-link-name flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400" placeholder="链接名称" value="${linkName}">
        <input type="url" class="task-link-url flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400" placeholder="https://..." value="${linkUrl}">
        <button type="button" class="remove-link-btn text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
    `;
    linksList.appendChild(linkDiv);
    
    // 删除链接事件
    linkDiv.querySelector('.remove-link-btn').addEventListener('click', () => {
        linkDiv.remove();
    });
}

function addModalTaskRow() {
    const container = document.getElementById('modal-tasks-container');
    const div = document.createElement('div');
    div.className = 'p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 space-y-3';
    div.innerHTML = `
        <div class="flex items-start justify-between">
            <input type="text" class="modal-task-text flex-1 p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400" placeholder="任务描述 *" required>
            <button type="button" class="remove-row-btn ml-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
        </div>
        
        <!-- 多链接区域 -->
        <div class="modal-task-links-container space-y-2">
            <div class="flex items-center justify-between">
                <label class="text-xs text-gray-600">🔗 任务链接（可选）</label>
                <button type="button" class="add-task-link-btn text-xs text-orange-500 hover:text-orange-700 font-medium">+ 添加链接</button>
            </div>
            <div class="modal-task-links-list space-y-2">
                <!-- 链接将在这里动态添加 -->
            </div>
        </div>
        
        <textarea class="modal-task-notes w-full p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400" rows="2" placeholder="📝 任务备注（可选）"></textarea>
        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="text-xs text-gray-600 mb-1 block">重复频率</label>
                <select class="modal-task-frequency w-full p-2 bg-white border border-gray-300 rounded-lg text-sm">
                    <option value="once">一次性</option>
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                </select>
            </div>
            <div>
                <label class="text-xs text-gray-600 mb-1 block">执行时间（可选）</label>
                <input type="time" class="modal-task-time w-full p-2 bg-white border border-gray-300 rounded-lg text-sm">
            </div>
        </div>
        <div class="modal-task-date-container hidden">
            <label class="text-xs text-gray-600 mb-1 block">指定日期</label>
            <input type="date" class="modal-task-date w-full p-2 bg-white border border-gray-300 rounded-lg text-sm">
        </div>
        <div class="modal-task-weekly-container hidden">
            <label class="text-xs text-gray-600 mb-1 block">选择星期</label>
            <div class="flex flex-wrap gap-2">
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="1"><span class="text-sm">周一</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="2"><span class="text-sm">周二</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="3"><span class="text-sm">周三</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="4"><span class="text-sm">周四</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="5"><span class="text-sm">周五</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="6"><span class="text-sm">周六</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="checkbox" class="modal-task-weekday" value="0"><span class="text-sm">周日</span>
                </label>
            </div>
        </div>
        <div class="modal-task-monthly-container hidden">
            <label class="text-xs text-gray-600 mb-1 block">每月第几天</label>
            <input type="number" class="modal-task-monthday w-full p-2 bg-white border border-gray-300 rounded-lg text-sm" min="1" max="31" placeholder="1-31">
        </div>
    `;
    container.appendChild(div);
    
    // 添加频率切换逻辑
    const frequencySelect = div.querySelector('.modal-task-frequency');
    const dateContainer = div.querySelector('.modal-task-date-container');
    const weeklyContainer = div.querySelector('.modal-task-weekly-container');
    const monthlyContainer = div.querySelector('.modal-task-monthly-container');
    
    frequencySelect.addEventListener('change', () => {
        const frequency = frequencySelect.value;
        dateContainer.classList.add('hidden');
        weeklyContainer.classList.add('hidden');
        monthlyContainer.classList.add('hidden');
        
        if (frequency === 'once') {
            dateContainer.classList.remove('hidden');
        } else if (frequency === 'weekly') {
            weeklyContainer.classList.remove('hidden');
        } else if (frequency === 'monthly') {
            monthlyContainer.classList.remove('hidden');
        }
    });
    
    // 添加链接按钮事件
    const addLinkBtn = div.querySelector('.add-task-link-btn');
    const linksList = div.querySelector('.modal-task-links-list');
    
    addLinkBtn.addEventListener('click', () => {
        addTaskLinkRow(linksList);
    });
}


function setupProjectEventListeners() {
    // 项目表单提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (editingProjectId) {
            // 编辑模式：更新现有项目
            await updateExistingProject();
        } else {
            // 创建模式：创建新项目
            await createNewProject();
        }
    });

    // 模态框事件
    document.getElementById('project-modal').addEventListener('click', e => {
        if (e.target.classList.contains('remove-row-btn')) {
            e.target.closest('.p-4.border-2').remove();
        }
    });

    document.getElementById('add-modal-task').addEventListener('click', addModalTaskRow);
    document.getElementById('cancel-project').addEventListener('click', closeProjectModal);

    // 板块设置事件监听器
    boardSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTitle = document.getElementById('board-title').value;
        const newColor = document.querySelector('.color-option.ring-4')?.dataset.color || 'purple';
        
        if (currentBoardKeyForSettings && window.appData.boards[currentBoardKeyForSettings]) {
            window.appData.boards[currentBoardKeyForSettings].title = newTitle;
            window.appData.boards[currentBoardKeyForSettings].color = newColor;
            await window.firebaseUtils.saveData(window.userId, window.appData);
            window.app.renderAll();
            closeBoardSettingsModal();
        }
    });

    document.getElementById('cancel-board-settings').addEventListener('click', closeBoardSettingsModal);
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('ring-4', 'ring-orange-500');
            });
            option.classList.add('ring-4', 'ring-orange-500');
        });
    });
}

// 创建新项目
async function createNewProject() {
        const newProject = {
            id: `proj-${currentBoardKeyForModal}-${Date.now()}`,
            title: document.getElementById('project-name').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            reviewDay: parseInt(document.getElementById('review-day').value),
            tasks: [],
            reviews: []
        };

        document.querySelectorAll('#modal-tasks-container > div').forEach(row => {
            const frequency = row.querySelector('.modal-task-frequency').value;
            
            // 收集链接
            const links = [];
            row.querySelectorAll('.task-link-row').forEach(linkRow => {
                const name = linkRow.querySelector('.task-link-name').value.trim();
                const url = linkRow.querySelector('.task-link-url').value.trim();
                if (name && url) {
                    links.push({ name, url });
                }
            });
            
            const task = {
                id: `task-${Date.now()}-${Math.random()}`,
                text: row.querySelector('.modal-task-text').value,
                links: links, // 多链接数组
                notes: row.querySelector('.modal-task-notes').value || '',
                frequency: frequency,
                time: row.querySelector('.modal-task-time').value || ''
            };
            
            // 根据频率类型添加额外字段
            if (frequency === 'once') {
                task.date = row.querySelector('.modal-task-date').value;
            } else if (frequency === 'weekly') {
                const weekdays = Array.from(row.querySelectorAll('.modal-task-weekday:checked')).map(cb => parseInt(cb.value));
                task.weekdays = weekdays;
            } else if (frequency === 'monthly') {
                task.monthDay = parseInt(row.querySelector('.modal-task-monthday').value) || 1;
            }
            
            newProject.tasks.push(task);
        });

        if (newProject.reviewDay > -1) {
            newProject.tasks.push({
                id: `task-${Date.now()}-review`,
                text: `为项目"${newProject.title}"进行每周复盘`,
                frequency: 'weekly',
                weekdays: [newProject.reviewDay],
                isReview: true,  // 标记为复盘任务
                link: '',
                notes: '点击日志图标📔开始复盘',
                time: ''
            });
        }
        
        window.appData.boards[currentBoardKeyForModal].projects.push(newProject);
        await window.firebaseUtils.saveData(window.userId, window.appData);
        window.app.renderAll();
        closeProjectModal();
}

// 更新现有项目
async function updateExistingProject() {
    const project = window.appData.boards[currentBoardKeyForModal].projects.find(p => p.id === editingProjectId);
    if (!project) return;
    
    // 保留现有的复盘记录
    const existingReviews = project.reviews || [];
    
    // 更新基本信息
    project.title = document.getElementById('project-name').value;
    project.startDate = document.getElementById('start-date').value;
    project.endDate = document.getElementById('end-date').value;
    project.reviewDay = parseInt(document.getElementById('review-day').value);
    
    // 重新构建任务列表（排除旧的复盘任务）
    const existingTaskIds = new Set();
    project.tasks = [];
    
    document.querySelectorAll('#modal-tasks-container > div').forEach((row, index) => {
        const frequency = row.querySelector('.modal-task-frequency').value;
        
        // 收集链接
        const links = [];
        row.querySelectorAll('.task-link-row').forEach(linkRow => {
            const name = linkRow.querySelector('.task-link-name').value.trim();
            const url = linkRow.querySelector('.task-link-url').value.trim();
            if (name && url) {
                links.push({ name, url });
            }
        });
        
        const task = {
            id: row.dataset.taskId || `task-${Date.now()}-${Math.random()}`, // 保留现有ID或生成新ID
            text: row.querySelector('.modal-task-text').value,
            links: links, // 多链接数组
            notes: row.querySelector('.modal-task-notes').value || '',
            frequency: frequency,
            time: row.querySelector('.modal-task-time').value || ''
        };
        
        // 确保ID唯一性
        while (existingTaskIds.has(task.id)) {
            task.id = `task-${Date.now()}-${Math.random()}`;
        }
        existingTaskIds.add(task.id);
        
        if (frequency === 'once') {
            task.date = row.querySelector('.modal-task-date').value;
        } else if (frequency === 'weekly') {
            const weekdays = Array.from(row.querySelectorAll('.modal-task-weekday:checked')).map(cb => parseInt(cb.value));
            task.weekdays = weekdays;
        } else if (frequency === 'monthly') {
            task.monthDay = parseInt(row.querySelector('.modal-task-monthday').value) || 1;
        }
        
        project.tasks.push(task);
    });
    
    // 重新生成复盘任务（如果设置了复盘日）
    if (project.reviewDay > -1) {
        project.tasks.push({
            id: `task-${Date.now()}-review`,
            text: `为项目"${project.title}"进行每周复盘`,
            frequency: 'weekly',
            weekdays: [project.reviewDay],
            isReview: true,
            link: '',
            notes: '点击日志图标📔开始复盘',
            time: ''
        });
    }
    
    // 恢复复盘记录
    project.reviews = existingReviews;
    
    console.log('✅ 项目更新完成:', project.title);
    console.log('📝 任务列表:', project.tasks);
    console.log('📅 项目日期:', project.startDate, '到', project.endDate);
    
    await window.firebaseUtils.saveData(window.userId, window.appData);
    window.app.renderAll();
    closeProjectModal();
}

// 导出项目管理模块
window.projectsModule = {
    renderAllBoards,
    renderSingleBoard,
    updateAllProgressBars,
    openProjectModal,
    openBoardSettingsModal,
    deleteBoard,
    deleteProject,
    setupProjectEventListeners
};
