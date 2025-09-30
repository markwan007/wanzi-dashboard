// 项目专属日历功能
const projectCalendarModal = document.getElementById('project-calendar-modal');
let currentProjectCalendar = null;
let currentProjectCalendarDate = new Date();

// 打开项目日历
function openProjectCalendar(projectId) {
    // 查找项目
    let project = null;
    let boardKey = null;
    
    Object.keys(window.appData.boards).forEach(key => {
        const board = window.appData.boards[key];
        const found = board.projects.find(p => p.id === projectId);
        if (found) {
            project = found;
            boardKey = key;
        }
    });
    
    if (!project) {
        console.error('项目未找到:', projectId);
        return;
    }
    
    currentProjectCalendar = { project, boardKey };
    
    // 设置日历初始日期为项目开始日期
    currentProjectCalendarDate = new Date(project.startDate + 'T00:00:00');
    
    // 填充项目信息
    document.getElementById('project-cal-title').textContent = `📅 ${project.title}`;
    document.getElementById('project-cal-period').textContent = `${project.startDate} ~ ${project.endDate}`;
    
    // 渲染日历
    renderProjectCalendar();
    
    // 显示弹窗
    projectCalendarModal.classList.remove('hidden');
    setTimeout(() => {
        projectCalendarModal.classList.remove('opacity-0');
        projectCalendarModal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

// 关闭项目日历
function closeProjectCalendar() {
    projectCalendarModal.classList.add('opacity-0');
    projectCalendarModal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => projectCalendarModal.classList.add('hidden'), 300);
    currentProjectCalendar = null;
}

// 渲染项目日历
function renderProjectCalendar() {
    if (!currentProjectCalendar) return;
    
    const { project, boardKey } = currentProjectCalendar;
    const board = window.appData.boards[boardKey];
    
    const year = currentProjectCalendarDate.getFullYear();
    const month = currentProjectCalendarDate.getMonth();
    
    // 更新月份标题
    document.getElementById('project-cal-month-year').textContent = 
        `${year}年${month + 1}月`;
    
    // 计算日历网格
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const grid = document.getElementById('project-cal-grid');
    grid.innerHTML = '';
    
    // 项目开始和结束日期
    const projectStart = new Date(project.startDate + 'T00:00:00');
    const projectEnd = new Date(project.endDate + 'T00:00:00');
    
    // 填充空白日期
    for (let i = 0; i < firstDayOfWeek; i++) {
        const cell = document.createElement('div');
        cell.className = 'text-center p-2';
        grid.appendChild(cell);
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = window.utils.toDateString(date);
        
        // 检查日期是否在项目周期内
        const isInProjectPeriod = date >= projectStart && date <= projectEnd;
        
        // 获取该日期的任务
        const tasksOnDate = getProjectTasksForDate(project, date);
        const hasTask = tasksOnDate.length > 0;
        
        const cell = document.createElement('button');
        cell.className = `text-center p-2 rounded-lg text-sm transition-colors ${
            !isInProjectPeriod ? 'text-gray-300 cursor-not-allowed' :
            hasTask ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold' :
            'hover:bg-gray-100 text-gray-700'
        }`;
        cell.textContent = day;
        
        if (isInProjectPeriod && hasTask) {
            cell.addEventListener('click', () => showProjectTasksForDate(date, tasksOnDate, board.color));
        }
        
        if (!isInProjectPeriod) {
            cell.disabled = true;
        }
        
        grid.appendChild(cell);
    }
    
    // 隐藏任务详情
    document.getElementById('project-cal-details').classList.add('hidden');
}

// 获取项目在某日期的任务
function getProjectTasksForDate(project, date) {
    const dateStr = window.utils.toDateString(date);
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const tasks = [];
    
    (project.tasks || []).forEach(task => {
        let shouldShow = false;
        
        if (task.frequency) {
            switch (task.frequency) {
                case 'daily':
                    shouldShow = true;
                    break;
                case 'once':
                    shouldShow = task.date === dateStr;
                    break;
                case 'weekly':
                    shouldShow = task.weekdays && task.weekdays.includes(dayOfWeek);
                    break;
                case 'monthly':
                    shouldShow = task.monthDay === dayOfMonth;
                    break;
            }
        } else if (task.type) {
            // 兼容旧系统
            if (task.type === 'daily') {
                shouldShow = true;
            } else if (task.type === 'once' && task.date === dateStr) {
                shouldShow = true;
            } else if (task.type === 'review' && dayOfWeek === project.reviewDay) {
                shouldShow = true;
            }
        }
        
        if (shouldShow) {
            tasks.push(task);
        }
    });
    
    // 按时间排序
    tasks.sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
    });
    
    return tasks;
}

// 显示某日期的任务详情
function showProjectTasksForDate(date, tasks, boardColor) {
    const detailsDiv = document.getElementById('project-cal-details');
    const dateTitle = document.getElementById('project-cal-selected-date');
    const tasksList = document.getElementById('project-cal-tasks-list');
    
    const dateStr = window.utils.toDateString(date);
    dateTitle.textContent = `📋 ${dateStr} 的任务`;
    
    const colors = window.utils.colorMap[boardColor] || window.utils.colorMap.gray;
    
    tasksList.innerHTML = tasks.map(task => {
        const isCompleted = window.calendarModule.isTaskCompletedOnDate(task.id, date);
        const timeStr = task.time ? `<span class="text-xs text-gray-500">${task.time}</span>` : '';
        const linkIcon = task.link ? `<a href="${task.link}" target="_blank" class="ml-2 text-orange-500 hover:text-orange-700">🔗</a>` : '';
        const notesStr = task.notes ? `<p class="text-xs text-gray-500 mt-1">📝 ${task.notes}</p>` : '';
        
        return `
            <div class="p-3 bg-white border border-gray-200 rounded-lg">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" class="custom-checkbox project-cal-task-checkbox" 
                                   data-task-id="${task.id}" 
                                   data-date="${dateStr}"
                                   ${isCompleted ? 'checked' : ''}>
                            <div class="w-2 h-2 rounded-full ${colors.dot}"></div>
                            <span class="font-medium text-gray-800 ${isCompleted ? 'line-through text-gray-400' : ''}">${task.text}</span>
                            ${linkIcon}
                        </div>
                        ${timeStr}
                        ${notesStr}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    detailsDiv.classList.remove('hidden');
}

// 月份切换
function changeProjectCalendarMonth(delta) {
    currentProjectCalendarDate.setMonth(currentProjectCalendarDate.getMonth() + delta);
    renderProjectCalendar();
}

// 设置事件监听器
function setupProjectCalendarEventListeners() {
    // 关闭按钮
    document.getElementById('close-project-calendar').addEventListener('click', closeProjectCalendar);
    
    // 月份导航
    document.getElementById('project-cal-prev').addEventListener('click', () => changeProjectCalendarMonth(-1));
    document.getElementById('project-cal-next').addEventListener('click', () => changeProjectCalendarMonth(1));
    
    // 日历图标点击
    document.addEventListener('click', (e) => {
        if (e.target.closest('.project-calendar-btn')) {
            const btn = e.target.closest('.project-calendar-btn');
            const projectId = btn.dataset.projectId;
            openProjectCalendar(projectId);
        }
    });
    
    // 任务复选框
    document.getElementById('project-cal-tasks-list').addEventListener('change', (e) => {
        if (e.target.classList.contains('project-cal-task-checkbox')) {
            const taskId = e.target.dataset.taskId;
            const dateStr = e.target.dataset.date;
            const date = new Date(dateStr + 'T00:00:00');
            window.calendarModule.toggleTaskCompletion(taskId, date);
            // 重新渲染日历（高亮可能会变化）
            renderProjectCalendar();
        }
    });
}

// 导出模块
window.projectCalendarModule = {
    openProjectCalendar,
    closeProjectCalendar,
    setupProjectCalendarEventListeners
};

