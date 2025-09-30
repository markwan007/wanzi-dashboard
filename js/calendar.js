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
            const linkHTML = taskInfo.link ? `<a href="${taskInfo.link}" target="_blank" class="task-label font-medium text-gray-800 cursor-pointer hover:text-orange-600 flex items-center ${isCompleted ? 'completed' : ''}">${taskInfo.text} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1 opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>` : `<label for="agenda-${taskInfo.id}" class="task-label font-medium text-gray-800 cursor-pointer ${isCompleted ? 'completed' : ''}">${taskInfo.text}</label>`;

            li.innerHTML = `
                <div class="mt-1 w-2 h-2 rounded-full ${colors.dot} flex-shrink-0"></div>
                <div class="flex-grow">${linkHTML}<p class="text-sm text-gray-500">${taskInfo.projectTitle}</p></div>
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
    const tasks = [];
    // 获取项目任务
    Object.keys(window.appData.boards).forEach(boardKey => {
        const board = window.appData.boards[boardKey];
        (board.projects || []).forEach(project => {
            const viewedDateStr = window.utils.toDateString(date);
            if(project.startDate && project.endDate && viewedDateStr >= project.startDate && viewedDateStr <= project.endDate) {
                (project.tasks || []).forEach(task => {
                    if (task.type === 'daily' || 
                       (task.type === 'once' && task.date === dateStr) ||
                       (task.type === 'review' && date.getDay() === project.reviewDay)) {
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
    setViewedDate: (date) => { viewedDate = date; }
};
