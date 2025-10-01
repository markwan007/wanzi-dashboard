// 工具函数
function toDateString(date) { 
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset*60*1000));
    return date.toISOString().split('T')[0];
}

function isSameDay(d1, d2) { 
    return toDateString(d1) === toDateString(d2); 
}

function getActiveBoardKey() {
    const activeNav = document.querySelector('.nav-item.active');
    return activeNav ? activeNav.dataset.board : 'home';
}

// 颜色映射
const colorMap = {
    purple: { gradient: 'from-red-500 to-orange-500', dot: 'bg-red-500', border: 'border-red-500' },
    blue: { gradient: 'from-orange-500 to-amber-500', dot: 'bg-orange-500', border: 'border-orange-500' },
    indigo: { gradient: 'from-amber-500 to-yellow-500', dot: 'bg-amber-500', border: 'border-amber-500' },
    rose: { gradient: 'from-rose-500 to-red-500', dot: 'bg-rose-500', border: 'border-rose-500' },
    amber: { gradient: 'from-yellow-400 to-amber-400', dot: 'bg-yellow-400', border: 'border-yellow-400' },
    gray: { gradient: 'from-gray-500 to-gray-600', dot: 'bg-gray-500', border: 'border-gray-500'}
};

// XSS防护：转义HTML特殊字符
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 统一的Toast提示函数（替代各个文件中重复的实现）
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'glass-pane px-6 py-3 rounded-lg shadow-lg text-gray-900 font-medium';
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }
}

// 构建任务链接HTML（共享逻辑，避免在calendar.js和projects.js中重复）
function buildTaskLinksHtml(task, taskIdPrefix, isCompleted, tooltipAttr) {
    const taskText = escapeHtml(task.text);
    const completedClass = isCompleted ? 'completed' : '';
    
    if (task.links && task.links.length > 0) {
        // 多链接显示
        const linksHtml = task.links.map(link => 
            `<a href="${escapeHtml(link.url)}" target="_blank" class="text-xs text-orange-500 hover:text-orange-700 underline ml-2" title="${escapeHtml(link.name)}">${escapeHtml(link.name)}</a>`
        ).join(' ');
        return `<label for="${taskIdPrefix}${task.id}" class="task-label font-medium text-gray-800 cursor-pointer ${completedClass}" ${tooltipAttr}>${taskText}</label>${linksHtml}`;
    } else if (task.link) {
        // 兼容旧的单链接格式
        return `<a href="${escapeHtml(task.link)}" target="_blank" class="task-label font-medium text-gray-800 cursor-pointer hover:text-orange-600 flex items-center ${completedClass}" ${tooltipAttr}>${taskText} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1 opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
    } else {
        // 无链接
        return `<label for="${taskIdPrefix}${task.id}" class="task-label font-medium text-gray-800 cursor-pointer ${completedClass}" ${tooltipAttr}>${taskText}</label>`;
    }
}

// 构建任务备注HTML
function buildTaskNotesHtml(notes, marginClass = 'ml-4') {
    return notes ? `<p class="text-xs text-gray-400 italic ${marginClass} mt-1">💡 ${escapeHtml(notes)}</p>` : '';
}

// 导出工具函数
window.utils = {
    toDateString,
    isSameDay,
    getActiveBoardKey,
    colorMap,
    escapeHtml,
    showToast,
    buildTaskLinksHtml,
    buildTaskNotesHtml
};
