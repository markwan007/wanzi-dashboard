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
        const tasksForProjectOnDate = window.calendarModule.getTasksForDate(window.calendarModule.getViewedDate()).filter(t => t.projectId === project.id && t.type !== 'review');
        const tasksHTML = tasksForProjectOnDate.map(task => {
             const isCompleted = window.calendarModule.isTaskCompletedOnDate(task.id, window.calendarModule.getViewedDate());
             const linkHTML = task.link ? `<a href="${task.link}" target="_blank" class="task-label ml-4 cursor-pointer hover:text-orange-600 flex items-center ${isCompleted ? 'completed' : ''}">${task.text} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1 opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>` : `<label for="board-task-${task.id}" class="task-label ml-4 cursor-pointer ${isCompleted ? 'completed' : ''}">${task.text}</label>`;
             return `<li class="flex items-center">
                        <input id="board-task-${task.id}" type="checkbox" class="custom-checkbox task-checkbox" data-task-id="${task.id}" ${isCompleted ? 'checked' : ''}>
                        ${linkHTML}
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
        <div class="glass-pane rounded-xl overflow-hidden glass-pane-hover border-t-4 ${colors.border}">
            <div class="p-6">
                <h4 class="text-lg font-semibold text-gray-900">${project.title}</h4>
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
            <button class="add-project-btn bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600" data-board-key="${key}">+ 新建项目</button>
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

// 板块设置模态框相关
const boardSettingsModal = document.getElementById('board-settings-modal');
const boardSettingsForm = document.getElementById('board-settings-form');
let currentBoardKeyForSettings;

function openProjectModal(boardKey) {
    currentBoardKeyForModal = boardKey;
    form.reset();
    document.getElementById('modal-tasks-container').innerHTML = '';
    addModalTaskRow();
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeProjectModal() {
     modal.classList.add('opacity-0');
     modal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
     setTimeout(() => modal.classList.add('hidden'), 300);
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

function addModalTaskRow() {
    const container = document.getElementById('modal-tasks-container');
    const div = document.createElement('div');
    div.className = 'p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 space-y-3';
    div.innerHTML = `
        <div class="flex items-start justify-between">
            <input type="text" class="modal-task-text flex-1 p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400" placeholder="任务描述 *" required>
            <button type="button" class="remove-row-btn ml-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
        </div>
        <input type="url" class="modal-task-link w-full p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400" placeholder="🔗 任务链接（可选）">
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
}


function setupProjectEventListeners() {
    // 项目表单提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
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
            const task = {
                id: `task-${Date.now()}-${Math.random()}`,
                text: row.querySelector('.modal-task-text').value,
                link: row.querySelector('.modal-task-link').value || '',
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
                type: 'review'
            });
        }
        
        window.appData.boards[currentBoardKeyForModal].projects.push(newProject);
        await window.firebaseUtils.saveData(window.userId, window.appData);
        window.app.renderAll();
        closeProjectModal();
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
        const selectedColor = document.querySelector('.color-option.border-orange-500').dataset.color;
        
        // 更新板块数据
        window.appData.boards[currentBoardKeyForSettings].title = newTitle;
        window.appData.boards[currentBoardKeyForSettings].color = selectedColor;
        
        // 更新导航栏标题
        const navItem = document.querySelector(`[data-board="${currentBoardKeyForSettings}"]`);
        if (navItem) {
            navItem.textContent = newTitle;
        }
        
        // 保存数据并重新渲染
        await window.firebaseUtils.saveData(window.userId, window.appData);
        window.projectsModule.renderSingleBoard(currentBoardKeyForSettings);
        closeBoardSettingsModal();
    });

    // 颜色选择器事件
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(b => {
                b.classList.remove('border-orange-500', 'ring-2', 'ring-orange-200');
                b.classList.add('border-gray-300');
            });
            btn.classList.remove('border-gray-300');
            btn.classList.add('border-orange-500', 'ring-2', 'ring-orange-200');
        });
    });

    document.getElementById('cancel-board-settings').addEventListener('click', closeBoardSettingsModal);
}

// 导出项目管理模块
window.projectsModule = {
    renderAllBoards,
    renderSingleBoard,
    updateAllProgressBars,
    openProjectModal,
    openBoardSettingsModal,
    setupProjectEventListeners
};
