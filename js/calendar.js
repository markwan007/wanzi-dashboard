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
        dayEl.className = 'calendar-day p-2 rounded-full cursor-pointer relative';
        dayEl.dataset.date = window.utils.toDateString(new Date(year, month, day));
        
        const tasksForDay = getTasksForDate(new Date(year, month, day));
        
        // 如果有任务，添加多色dots
        if(tasksForDay.length > 0) {
            // 获取该日期涉及的板块颜色
            const boardColors = [...new Set(tasksForDay.map(task => task.color))];
            
            // 创建dots容器
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'dots-container';
            
            // 为每个板块颜色创建一个dot，最多显示4个
            boardColors.slice(0, 4).forEach(color => {
                const dot = document.createElement('div');
                const colorClass = window.utils.colorMap[color]?.dot || 'bg-gray-500';
                dot.className = `board-dot ${colorClass}`;
                dot.title = `${window.appData.boards[Object.keys(window.appData.boards).find(key => window.appData.boards[key].color === color)]?.title || '未知板块'}板块有任务`;
                dotsContainer.appendChild(dot);
            });
            
            // 如果板块超过4个，添加省略号dot
            if (boardColors.length > 4) {
                const moreDot = document.createElement('div');
                moreDot.className = 'board-dot bg-gray-400';
                moreDot.title = `还有${boardColors.length - 4}个板块有任务`;
                dotsContainer.appendChild(moreDot);
            }
            
            dayEl.appendChild(dotsContainer);
        }

        if (window.utils.isSameDay(new Date(year, month, day), new Date())) dayEl.classList.add('today');
        if (window.utils.isSameDay(new Date(year, month, day), viewedDate)) dayEl.classList.add('selected');
        
        calendarGrid.appendChild(dayEl);
    }
}

function renderAgenda() {
    const agendaList = document.getElementById('agenda-list');
    const tasksForViewedDate = getTasksForDate(viewedDate);
    
    const isToday = window.utils.isSameDay(viewedDate, new Date());
    
    // 更新标题
    const welcomeTitle = document.getElementById('welcome-title');
    const dateDisplay = document.getElementById('viewed-date-display');
    
    // 更新日期徽章
    const dateDay = document.getElementById('date-day');
    const dateMonthYear = document.getElementById('date-month-year');
    
    dateDay.textContent = viewedDate.getDate();
    dateMonthYear.textContent = viewedDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
    });
    
    if (isToday) {
        welcomeTitle.textContent = window.utils.getDailyPhilosophy();
        dateDisplay.textContent = viewedDate.toLocaleDateString('zh-CN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else {
        welcomeTitle.textContent = '计划回顾';
        dateDisplay.textContent = viewedDate.toLocaleDateString('zh-CN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    agendaList.innerHTML = '';
    
    if (tasksForViewedDate.length === 0) {
        agendaList.innerHTML = '<li class="text-gray-400">当天没有任务</li>';
        return;
    }
    
    // 按板块分组任务
    const tasksByBoard = {};
    const boardOrder = ['startup', 'finance', 'learning', 'health', 'misc', 'event'];
    
    tasksForViewedDate.forEach(task => {
        const boardKey = task.boardKey || 'event';
        if (!tasksByBoard[boardKey]) {
            tasksByBoard[boardKey] = [];
        }
        tasksByBoard[boardKey].push(task);
    });
    
    // 按顺序渲染每个板块
    boardOrder.forEach(boardKey => {
        const tasks = tasksByBoard[boardKey];
        if (!tasks || tasks.length === 0) return;
        
        // 获取板块信息
        const boardData = window.appData?.boards[boardKey];
        const boardTitle = boardData?.title || (boardKey === 'event' ? '临时事件' : boardKey);
        const boardColor = boardData?.color || 'gray';
        const colors = window.utils.colorMap[boardColor] || window.utils.colorMap.gray;
        
        // 创建板块分组标题
        const groupHeader = document.createElement('li');
        groupHeader.className = 'pt-4 pb-2 first:pt-0';
        groupHeader.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded ${colors.dot}"></div>
                <h4 class="font-semibold text-gray-700">${window.utils.escapeHtml(boardTitle)}</h4>
                <span class="text-xs text-gray-400">(${tasks.length}个任务)</span>
            </div>
        `;
        agendaList.appendChild(groupHeader);
        
        // 渲染该板块的所有任务
        tasks.forEach(taskInfo => {
            const li = document.createElement('li');
            li.className = 'flex items-start space-x-3 ml-5 mb-3';
            const isCompleted = isTaskCompletedOnDate(taskInfo.id, viewedDate);
            
            // 备注 tooltip
            const tooltipAttr = taskInfo.notes ? `title="${window.utils.escapeHtml(taskInfo.notes)}"` : '';
            
            // 使用共享函数构建任务链接HTML
            const linkHTML = window.utils.buildTaskLinksHtml(taskInfo, 'agenda-', isCompleted, tooltipAttr);

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
            
            // 备注显示（使用共享函数）
            const notesHTML = window.utils.buildTaskNotesHtml(taskInfo.notes, 'ml-4');
            
            li.innerHTML = `
                <div class="mt-1 w-2 h-2 rounded-full ${colors.dot} flex-shrink-0"></div>
                <div class="flex-grow">
                    ${linkHTML}
                    ${notesHTML}
                </div>
                ${reviewIconHTML}
                ${skipButtonHTML}
                <input id="agenda-${taskInfo.id}" type="checkbox" class="custom-checkbox mt-1 task-checkbox" data-task-id="${taskInfo.id}" ${isCompleted ? 'checked' : ''}>
            `;
            agendaList.appendChild(li);
        });
    });
}

function getTasksForDate(date) {
    if (!window.appData) return [];
    const dateStr = window.utils.toDateString(date);
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    const dayOfMonth = date.getDate(); // 1-31
    const tasks = [];
    
    console.log('🔍 获取任务 - 日期:', dateStr, '星期:', dayOfWeek, '日:', dayOfMonth);
    
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
                    
                    console.log('  📋 检查任务:', task.text, '频率:', task.frequency);
                    
                    // 新的频率系统
                    if (task.frequency) {
                        switch (task.frequency) {
                            case 'daily':
                                shouldShow = true;
                                console.log('    ✅ 每日任务 - 显示');
                                break;
                            case 'once':
                                shouldShow = task.date === dateStr;
                                console.log('    📅 一次性 - 任务日期:', task.date, '今天:', dateStr, '显示:', shouldShow);
                                break;
                            case 'weekly':
                                shouldShow = task.weekdays && task.weekdays.includes(dayOfWeek);
                                console.log('    📆 每周 - 任务星期:', task.weekdays, '今天星期:', dayOfWeek, '显示:', shouldShow);
                                break;
                            case 'monthly':
                                shouldShow = task.monthDay === dayOfMonth;
                                console.log('    📆 每月 - 任务日:', task.monthDay, '今天日:', dayOfMonth, '显示:', shouldShow);
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
                        tasks.push({ ...task, projectTitle: project.title, projectId: project.id, color: board.color, boardKey: boardKey });
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
    
    // 定义板块顺序（按boardKey排序，而不是颜色）
    const boardOrder = {
        'startup': 1,   // 创业
        'finance': 2,   // 财务
        'learning': 3,  // 学习
        'health': 4,    // 健康
        'misc': 5,      // 其他
        'event': 6      // 临时事件
    };
    
    // 先按板块顺序排序，再按执行时间排序
    tasks.sort((a, b) => {
        // 首先按板块顺序（使用boardKey，临时事件没有boardKey）
        const orderA = boardOrder[a.boardKey] || 999;
        const orderB = boardOrder[b.boardKey] || 999;
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        // 同一板块内按时间排序
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
    // 检查是否是临时事件（ID以evt-开头）
    if (taskId.startsWith('evt-')) {
        // 临时事件直接删除
        if (window.appData.events) {
            window.appData.events = window.appData.events.filter(e => e.id !== taskId);
            await window.firebaseUtils.saveData(window.userId, window.appData);
            renderAgenda();
            
            // 显示删除提示
            showDeleteEventToast();
        }
        return;
    }
    
    // 普通任务添加到跳过列表
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

// 显示跳过任务的提示（使用共享Toast函数）
function showSkipToast() {
    window.utils.showToast('✓ 任务已跳过（明天会重新出现）');
}

// 显示删除临时事件的提示（使用共享Toast函数）
function showDeleteEventToast() {
    window.utils.showToast('✓ 临时事件已删除');
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
