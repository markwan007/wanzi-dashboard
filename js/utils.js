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

// 导出工具函数
window.utils = {
    toDateString,
    isSameDay,
    getActiveBoardKey,
    colorMap
};
