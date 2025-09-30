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

        const kpisHTML = (project.kpis || []).map(kpi => `
            <div class="text-sm">
                <label class="font-medium text-gray-600">${kpi.text}</label>
                <div class="flex items-center mt-1">
                    <input type="number" value="${kpi.currentValue}" class="kpi-input w-20 p-1 text-center bg-white/50 border border-gray-300 rounded-lg" data-project-id="${project.id}" data-kpi-id="${kpi.id}">
                    <span class="mx-2 text-gray-400">/</span>
                    <span class="font-semibold">${kpi.targetValue}</span>
                </div>
            </div>
        `).join('');
        
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
                
                <div class="flex border-b mb-4 text-sm font-medium text-gray-500">
                    <button class="project-tab active" data-tab="tasks" data-project-id="${project.id}">任务</button>
                    <button class="project-tab ml-4" data-tab="kpis" data-project-id="${project.id}">KPIs</button>
                    <button class="project-tab ml-4" data-tab="reviews" data-project-id="${project.id}">复盘日志</button>
                </div>

                <div class="project-tab-content" data-tab-content="tasks" data-project-id="${project.id}">
                    <ul class="space-y-4 mb-6 min-h-[50px]">${tasksHTML || '<p class="text-sm text-gray-400">今天没有此项目的任务。</p>'}</ul>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="progress-bar-inner bg-gradient-to-r ${colors.gradient} h-2.5 rounded-full" data-project-id="${project.id}" style="width: 0%"></div>
                    </div>
                </div>
                <div class="project-tab-content hidden" data-tab-content="kpis" data-project-id="${project.id}">
                    <div class="space-y-4">${kpisHTML || '<p class="text-sm text-gray-400">未设定KPI。</p>'}</div>
                </div>
                <div class="project-tab-content hidden" data-tab-content="reviews" data-project-id="${project.id}">
                    <div class="max-h-40 overflow-y-auto mb-4">${reviewsHTML || '<p class="text-sm text-gray-400">暂无复盘记录。</p>'}</div>
                    <form class="review-form" data-project-id="${project.id}">
                        <textarea class="w-full p-2 bg-white/50 border border-gray-300 rounded-lg text-sm" rows="1" placeholder="本周成就..." name="wins" required></textarea>
                        <textarea class="w-full mt-2 p-2 bg-white/50 border border-gray-300 rounded-lg text-sm" rows="1" placeholder="遇到的挑战..." name="challenges" required></textarea>
                        <textarea class="w-full mt-2 p-2 bg-white/50 border border-gray-300 rounded-lg text-sm" rows="1" placeholder="学到的经验..." name="learnings" required></textarea>
                        <textarea class="w-full mt-2 p-2 bg-white/50 border border-gray-300 rounded-lg text-sm" rows="1" placeholder="下周计划..." name="nextSteps" required></textarea>
                        <button type="submit" class="mt-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg">保存复盘</button>
                    </form>
                </div>
            </div>
        </div>`
    }).join('');

    panel.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">${data.title}</h3>
            <button class="add-project-btn bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600" data-board-key="${key}">+ 新建项目</button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">${projectsHTML}</div>
    `;
    updateAllProgressBars();
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

function openProjectModal(boardKey) {
    currentBoardKeyForModal = boardKey;
    form.reset();
    document.getElementById('modal-tasks-container').innerHTML = '';
    document.getElementById('modal-kpis-container').innerHTML = '';
    addModalTaskRow();
    addModalKpiRow();
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

function addModalTaskRow() {
    const container = document.getElementById('modal-tasks-container');
    const div = document.createElement('div');
    div.className = 'p-2 border rounded-lg';
    div.innerHTML = `
        <input type="text" class="modal-task-text w-full p-2 mb-2 bg-transparent border-b" placeholder="任务描述" required>
        <input type="url" class="modal-task-link w-full p-2 mb-2 bg-transparent border-b" placeholder="链接 (可选)">
        <div class="flex items-center space-x-2">
            <select class="modal-task-type p-2 bg-white/50 border border-gray-300 rounded-lg">
                <option value="daily">每日</option>
                <option value="once">指定日期</option>
            </select>
            <input type="date" class="modal-task-date p-2 bg-white/50 border border-gray-300 rounded-lg hidden">
            <button type="button" class="remove-row-btn text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
        </div>`;
    container.appendChild(div);
}

function addModalKpiRow() {
    const container = document.getElementById('modal-kpis-container');
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `<input type="text" class="modal-kpi-text w-full p-2 bg-white/50 border border-gray-300 rounded-lg" placeholder="KPI描述" required><input type="number" class="modal-kpi-target w-32 p-2 bg-white/50 border border-gray-300 rounded-lg" placeholder="目标值" required><button type="button" class="remove-row-btn text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>`;
    container.appendChild(div);
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
            kpis: [],
            reviews: []
        };

        document.querySelectorAll('#modal-tasks-container > div').forEach(row => {
            newProject.tasks.push({
                id: `task-${Date.now()}-${Math.random()}`,
                text: row.querySelector('.modal-task-text').value,
                link: row.querySelector('.modal-task-link').value,
                type: row.querySelector('.modal-task-type').value,
                date: row.querySelector('.modal-task-date').value
            });
        });
        
        document.querySelectorAll('#modal-kpis-container > div').forEach(row => {
            newProject.kpis.push({
                id: `kpi-${Date.now()}-${Math.random()}`,
                text: row.querySelector('.modal-kpi-text').value,
                targetValue: parseFloat(row.querySelector('.modal-kpi-target').value),
                currentValue: 0
            });
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
            e.target.closest('.p-2.border, .flex.items-center').remove();
        }
    });
    
    document.getElementById('modal-tasks-container').addEventListener('change', e => {
        if (e.target.classList.contains('modal-task-type')) {
            const row = e.target.closest('div');
            row.querySelector('.modal-task-date').classList.toggle('hidden', e.target.value !== 'once');
        }
    });

    document.getElementById('add-modal-task').addEventListener('click', addModalTaskRow);
    document.getElementById('add-modal-kpi').addEventListener('click', addModalKpiRow);
    document.getElementById('cancel-project').addEventListener('click', closeProjectModal);
}

// 导出项目管理模块
window.projectsModule = {
    renderAllBoards,
    renderSingleBoard,
    updateAllProgressBars,
    openProjectModal,
    setupProjectEventListeners
};
