// 复盘日志功能
const reviewJournalModal = document.getElementById('review-journal-modal');
const reviewJournalForm = document.getElementById('review-journal-form');
let currentReviewProjectId = null;
let currentReviewBoardKey = null;

// 打开复盘日志弹窗
function openReviewJournal(projectId) {
    // 查找项目所属的板块和项目数据
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
    
    currentReviewProjectId = projectId;
    currentReviewBoardKey = boardKey;
    
    // 填充项目信息
    document.getElementById('review-project-title').textContent = project.title;
    document.getElementById('review-project-period').textContent = `${project.startDate} ~ ${project.endDate}`;
    
    // 清空表单
    reviewJournalForm.reset();
    
    // 渲染历史记录
    renderReviewHistory(project.reviews || []);
    
    // 显示弹窗
    reviewJournalModal.classList.remove('hidden');
    setTimeout(() => {
        reviewJournalModal.classList.remove('opacity-0');
        reviewJournalModal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

// 关闭复盘日志弹窗
function closeReviewJournal() {
    reviewJournalModal.classList.add('opacity-0');
    reviewJournalModal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => reviewJournalModal.classList.add('hidden'), 300);
}

// 渲染历史记录
function renderReviewHistory(reviews) {
    const historyList = document.getElementById('review-history-list');
    
    if (!reviews || reviews.length === 0) {
        historyList.innerHTML = '<p class="text-gray-400 text-center py-8">暂无历史记录</p>';
        return;
    }
    
    // 按时间倒序排列
    const sortedReviews = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
    
    historyList.innerHTML = sortedReviews.map((review, index) => `
        <div class="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-semibold text-gray-900">第 ${reviews.length - index} 次复盘</h4>
                    <p class="text-sm text-gray-500">${review.date}</p>
                </div>
                <button class="delete-review-btn text-red-500 hover:text-red-700 text-sm" data-review-date="${review.date}" title="删除">
                    ✕
                </button>
            </div>
            <div class="space-y-2 text-sm">
                <div>
                    <span class="font-medium text-green-600">🎉 成就:</span>
                    <p class="text-gray-700 mt-1">${review.wins}</p>
                </div>
                <div>
                    <span class="font-medium text-amber-600">💪 挑战:</span>
                    <p class="text-gray-700 mt-1">${review.challenges}</p>
                </div>
                <div>
                    <span class="font-medium text-blue-600">💡 经验:</span>
                    <p class="text-gray-700 mt-1">${review.learnings}</p>
                </div>
                <div>
                    <span class="font-medium text-purple-600">🎯 计划:</span>
                    <p class="text-gray-700 mt-1">${review.nextSteps}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// 保存复盘
async function saveReview(event) {
    event.preventDefault();
    
    const project = window.appData.boards[currentReviewBoardKey].projects.find(p => p.id === currentReviewProjectId);
    if (!project) return;
    
    if (!project.reviews) project.reviews = [];
    
    const formData = new FormData(reviewJournalForm);
    const newReview = {
        date: window.utils.toDateString(new Date()),
        wins: formData.get('wins'),
        challenges: formData.get('challenges'),
        learnings: formData.get('learnings'),
        nextSteps: formData.get('nextSteps')
    };
    
    project.reviews.push(newReview);
    
    await window.firebaseUtils.saveData(window.userId, window.appData);
    
    // 清空表单
    reviewJournalForm.reset();
    
    // 重新渲染历史记录
    renderReviewHistory(project.reviews);
    
    // 显示成功提示
    showToast('复盘已保存！');
}

// 删除复盘
async function deleteReview(reviewDate) {
    if (!confirm('确定要删除这条复盘记录吗？')) return;
    
    const project = window.appData.boards[currentReviewBoardKey].projects.find(p => p.id === currentReviewProjectId);
    if (!project || !project.reviews) return;
    
    project.reviews = project.reviews.filter(r => r.date !== reviewDate);
    
    await window.firebaseUtils.saveData(window.userId, window.appData);
    
    // 重新渲染历史记录
    renderReviewHistory(project.reviews);
    
    showToast('复盘已删除');
}

// 显示提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'glass-pane px-6 py-3 rounded-lg shadow-lg text-gray-900 font-medium';
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// 设置事件监听器
function setupReviewEventListeners() {
    // 表单提交
    reviewJournalForm.addEventListener('submit', saveReview);
    
    // 关闭按钮
    document.getElementById('close-review-journal').addEventListener('click', closeReviewJournal);
    
    // 删除复盘
    document.getElementById('review-history-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-review-btn')) {
            const reviewDate = e.target.dataset.reviewDate;
            deleteReview(reviewDate);
        }
    });
    
    // 日志按钮点击
    document.addEventListener('click', (e) => {
        if (e.target.closest('.review-journal-btn')) {
            const btn = e.target.closest('.review-journal-btn');
            const projectId = btn.dataset.projectId;
            openReviewJournal(projectId);
        }
    });
}

// 导出模块
window.reviewModule = {
    openReviewJournal,
    closeReviewJournal,
    setupReviewEventListeners
};
