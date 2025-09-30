// 日历相关功能
let viewedDate = new Date();
let calendarDate = new Date();

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    document.getElementById('month-year').textContent = `${year}年 ${month + 1}月`;
    
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) calendarGrid.innerHTML += `<div></div>`;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        dayEl.className = 'calendar-day p-2 rounded-full cursor-pointer';
        dayEl.dataset.date = window.utils.toDateString(new Date(year, month, day));
        
        const tasksForDay = getTasksForDate(new Date(year, month, day));
        if(tasksForDay.length > 0) dayEl.classList.add('event-day');

        if (window.utils.isSameDay(new Date(year, month, day), new Date())) dayEl.classList.add('today');
        if (window.utils.isSameDay(new Date(year, month, day), viewedDate)) dayEl.classList.add('selected');
        
        calendarGrid.appendChild(dayEl);
    }
}

function renderAgenda() {
    const agendaList = document.getElementById('agenda-list');
    const tasksForViewedDate = getTasksForDate(viewedDate);
    
    document.getElementById('viewed-date-display').textContent = `正在查看 ${viewedDate.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    document.getElementById('welcome-title').textContent = window.utils.isSameDay(viewedDate, new Date()) ? '你好，欢迎回来！' : `计划回顾`;

    agendaList.innerHTML = '';
    if (tasksForViewedDate.length > 0) {
        tasksForViewedDate.forEach(taskInfo => {
            const li = document.createElement('li');
            li.className = 'flex items-start space-x-3';
            const isCompleted = isTaskCompletedOnDate(taskInfo.id, viewedDate);
            const colors = window.utils.colorMap[taskInfo.color] || window.utils.colorMap.gray;
            
            // 备注 tooltip
            const tooltipAttr = taskInfo.notes ? `title="${taskInfo.notes}"` : '';
            
            // 任务文本和链接
            let linkHTML = '';
            if (taskInfo.links && taskInfo.links.length > 0) {
                // 多链接显示
                const linksHtml = taskInfo.links.map(link => 
                    `<a href="${link.url}" target="_blank" class="text-xs text-orange-500 hover:text-orange-700 underline ml-2" title="${link.name}">${link.name}</a>`
                ).join(' ');
                linkHTML = `<label for="agenda-${taskInfo.id}" class="task-label font-medium text-gray-800 cursor-pointer ${isCompleted ? 'completed' : ''}" ${tooltipAttr}>${taskInfo.text}</label>${linksHtml}`;
            } else if (taskInfo.link) {
                // 兼容旧的单链接格式
                linkHTML = `<a href="${taskInfo.link}" target="_blank" class="task-label font-medium text-gray-800 cursor-pointer hover:text-orange-600 flex items-center ${isCompleted ? 'completed' : ''}" ${tooltipAttr}>${taskInfo.text} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1 opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
            } else {
                // 无链接
                linkHTML = `<label for="agenda-${taskInfo.id}" class="task-label font-medium text-gray-800 cursor-pointer ${isCompleted ? 'completed' : ''}" ${tooltipAttr}>${taskInfo.text}</label>`;
            }

                        // 为复盘任务添加日志图标
                        const reviewIconHTML = taskInfo.isReview ? `
                            <button class="review-journal-btn p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors" 
                                    data-task-id="${taskInfo.id}" 
                                    data-project-id="${taskInfo.projectId}"
                                    title="打开复盘日志">
                                📔
                            </button>
                        ` : '';
                        
                        // 跳过按钮（小叉叉）
                        const skipButtonHTML = `
                            <button class="skip-task-btn text-gray-400 hover:text-red-500 p-1 text-sm transition-colors" 
                                    data-task-id="${taskInfo.id}" 
                                    title="今天跳过此任务">
                                ✕
                            </button>
                        `;
                        
                        // 备注显示
                        const notesHTML = taskInfo.notes ? `<p class="text-xs text-gray-400 italic ml-4 mt-1">💡 ${taskInfo.notes}</p>` : '';
                        
                        li.innerHTML = `
                            <div class="mt-1 w-2 h-2 rounded-full ${colors.dot} flex-shrink-0"></div>
                            <div class="flex-grow">
                                ${linkHTML}
                                <p class="text-sm text-gray-500">${taskInfo.projectTitle}</p>
                                ${notesHTML}
                            </div>
                            ${reviewIconHTML}
                            ${skipButtonHTML}
                            <input id="agenda-${taskInfo.id}" type="checkbox" class="custom-checkbox mt-1 task-checkbox" data-task-id="${taskInfo.id}" ${isCompleted ? 'checked' : ''}>
                        `;
            agendaList.appendChild(li);
        });
    } else {
        agendaList.innerHTML = '<li class="text-gray-400">当天没有任务</li>';
    }
}

function getTasksForDate(date) {
    if (!window.appData) return [];
    const dateStr = window.utils.toDateString(date);
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    const dayOfMonth = date.getDate(); // 1-31
    const tasks = [];
    
    // 获取今日跳过的任务列表
    const skippedTasks = (window.appData.skippedTasks && window.appData.skippedTasks[dateStr]) || [];
    
    // 获取项目任务
    Object.keys(window.appData.boards).forEach(boardKey => {
        const board = window.appData.boards[boardKey];
        (board.projects || []).forEach(project => {
            const viewedDateStr = window.utils.toDateString(date);
            if(project.startDate && project.endDate && viewedDateStr >= project.startDate && viewedDateStr <= project.endDate) {
                (project.tasks || []).forEach(task => {
                    let shouldShow = false;
                    
                    // 新的频率系统
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
                    } 
                    // 兼容旧的type系统
                    else if (task.type) {
                        if (task.type === 'daily') {
                            shouldShow = true;
                        } else if (task.type === 'once' && task.date === dateStr) {
                            shouldShow = true;
                        } else if (task.type === 'review' && dayOfWeek === project.reviewDay) {
                            shouldShow = true;
                        }
                    }
                    
                    // 如果任务被跳过，则不显示
                    if (shouldShow && !skippedTasks.includes(task.id)) {
                        tasks.push({ ...task, projectTitle: project.title, projectId: project.id, color: board.color });
                    }
                });
            }
        });
    });
    
    // 获取临时事件
    (window.appData.events || []).forEach(event => {
        if (event.date === dateStr) {
            tasks.push({ id: event.id, text: event.title, projectTitle: '临时事件', color: 'gray' });
        }
    });
    
    // 按执行时间排序
    tasks.sort((a, b) => {
        if (a.time && b.time) {
            return a.time.localeCompare(b.time);
        }
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
    });
    
    return tasks;
}

function isTaskCompletedOnDate(taskId, date) {
    const dateStr = window.utils.toDateString(date);
    return window.appData.taskCompletions && window.appData.taskCompletions[taskId]?.includes(dateStr) || false;
}

async function toggleTaskCompletion(taskId) {
    const dateStr = window.utils.toDateString(viewedDate);
    if (!window.appData.taskCompletions[taskId]) window.appData.taskCompletions[taskId] = [];
    const completedIndex = window.appData.taskCompletions[taskId].indexOf(dateStr);
    if (completedIndex > -1) {
        window.appData.taskCompletions[taskId].splice(completedIndex, 1);
    } else {
        window.appData.taskCompletions[taskId].push(dateStr);
    }
    await window.firebaseUtils.saveData(window.userId, window.appData);
    window.app.renderAll();
}

// 跳过任务（今天不做）
async function skipTask(taskId) {
    const dateStr = window.utils.toDateString(viewedDate);
    
    if (!window.appData.skippedTasks) {
        window.appData.skippedTasks = {};
    }
    if (!window.appData.skippedTasks[dateStr]) {
        window.appData.skippedTasks[dateStr] = [];
    }
    
    // 添加到跳过列表
    if (!window.appData.skippedTasks[dateStr].includes(taskId)) {
        window.appData.skippedTasks[dateStr].push(taskId);
        await window.firebaseUtils.saveData(window.userId, window.appData);
        renderAgenda();
        
        // 显示提示
        showSkipToast();
    }
}

// 显示跳过任务的提示
function showSkipToast() {
    const toast = document.createElement('div');
    toast.className = 'glass-pane px-6 py-3 rounded-lg shadow-lg text-gray-900 font-medium';
    toast.textContent = '✓ 任务已跳过（明天会重新出现）';
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

function setupCalendarEventListeners() {
    document.getElementById('prev-month').addEventListener('click', () => { 
        calendarDate.setMonth(calendarDate.getMonth() - 1); 
        renderCalendar(); 
    });
    
    document.getElementById('next-month').addEventListener('click', () => { 
        calendarDate.setMonth(calendarDate.getMonth() + 1); 
        renderCalendar(); 
    });
    
    document.getElementById('calendar-grid').addEventListener('click', e => {
        if(e.target.dataset.date) {
            viewedDate = new Date(e.target.dataset.date + 'T00:00:00'); 
            window.app.renderAll();
        }
    });
    
    document.getElementById('add-event-btn').addEventListener('click', async () => {
        const title = prompt(`为 ${window.utils.toDateString(viewedDate)} 添加一个临时事件:`);
        if (title) {
            if(!window.appData.events) window.appData.events = [];
            window.appData.events.push({
                id: `evt-${Date.now()}`,
                date: window.utils.toDateString(viewedDate),
                title: title
            });
            await window.firebaseUtils.saveData(window.userId, window.appData);
            window.app.renderAll();
        }
    });
}

// 导出日历模块
window.calendarModule = {
    renderCalendar,
    renderAgenda,
    setupCalendarEventListeners,
    getViewedDate: () => viewedDate,
    setViewedDate: (date) => { viewedDate = date; },
    getTasksForDate,
    isTaskCompletedOnDate,
    toggleTaskCompletion,
    skipTask
};
