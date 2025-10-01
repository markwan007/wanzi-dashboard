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

// 颜色映射 - 彩虹色系：红橙黄绿青蓝紫
const colorMap = {
    // 新的彩虹色系
    red: { gradient: 'from-red-500 to-red-600', dot: 'bg-red-500', border: 'border-red-500' },
    orange: { gradient: 'from-orange-500 to-orange-600', dot: 'bg-orange-500', border: 'border-orange-500' },
    yellow: { gradient: 'from-yellow-400 to-yellow-500', dot: 'bg-yellow-400', border: 'border-yellow-400' },
    green: { gradient: 'from-green-500 to-green-600', dot: 'bg-green-500', border: 'border-green-500' },
    cyan: { gradient: 'from-cyan-500 to-cyan-600', dot: 'bg-cyan-500', border: 'border-cyan-500' },
    blue: { gradient: 'from-blue-500 to-blue-600', dot: 'bg-blue-500', border: 'border-blue-500' },
    purple: { gradient: 'from-purple-500 to-purple-600', dot: 'bg-purple-500', border: 'border-purple-500' },
    gray: { gradient: 'from-gray-500 to-gray-600', dot: 'bg-gray-500', border: 'border-gray-500'},
    // 旧颜色名称兼容（为已有数据提供映射）
    indigo: { gradient: 'from-yellow-400 to-yellow-500', dot: 'bg-yellow-400', border: 'border-yellow-400' },
    rose: { gradient: 'from-green-500 to-green-600', dot: 'bg-green-500', border: 'border-green-500' },
    amber: { gradient: 'from-cyan-500 to-cyan-600', dot: 'bg-cyan-500', border: 'border-cyan-500' }
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


// 每日哲学名言库
const philosophyQuotes = [
    "未经审视的人生不值得过。 —— 苏格拉底",
    "我思故我在。 —— 笛卡尔",
    "人是万物的尺度。 —— 普罗泰戈拉",
    "认识你自己。 —— 德尔斐神庙箴言",
    "存在先于本质。 —— 萨特",
    "凡是合乎理性的东西都是现实的，凡是现实的东西都是合乎理性的。 —— 黑格尔",
    "他人即地狱。 —— 萨特",
    "人生而自由，却无往不在枷锁之中。 —— 卢梭",
    "知识就是力量。 —— 培根",
    "理性为感性所引导，就如同盲人为明眼人所引导。 —— 叔本华",
    "生活不是被命运支配的，而是被我们的决定所塑造的。 —— 维克多·弗兰克",
    "我们的痛苦源于对痛苦的抗拒。 —— 佛陀",
    "人如其所思。 —— 马库斯·奥勒留",
    "万物皆流，无物常住。 —— 赫拉克利特",
    "吾生也有涯，而知也无涯。 —— 庄子",
    "天行健，君子以自强不息。 —— 《周易》",
    "知之为知之，不知为不知，是知也。 —— 孔子",
    "道可道，非常道。名可名，非常名。 —— 老子",
    "简单是终极的复杂。 —— 达芬奇",
    "你永远不会真正理解一个人，直到你从他的角度看事情。 —— 《杀死一只知更鸟》"
];

// 获取每日哲学名言（根据日期固定，每天一句）
function getDailyPhilosophy() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % philosophyQuotes.length;
    return philosophyQuotes[index];
}

// 导出工具函数
window.utils = {
    getDailyPhilosophy,
    toDateString,
    isSameDay,
    getActiveBoardKey,
    colorMap,
    escapeHtml,
    showToast,
    buildTaskLinksHtml,
    buildTaskNotesHtml
};
