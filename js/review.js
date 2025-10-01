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
    
    // 计算并显示本周数据统计
    renderWeeklyStats(project, boardKey);
    
    // 显示当前日期
    const today = new Date();
    const dateDisplay = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    document.getElementById('review-date-display').textContent = dateDisplay;
    
    // 清空表单
    reviewJournalForm.reset();
    document.getElementById('selected-mood').value = '';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected-mood'));
    
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

// 渲染本周数据统计
function renderWeeklyStats(project, boardKey) {
    const board = window.appData.boards[boardKey];
    const today = new Date();
    
    // 计算本周的日期范围（周一到周日）
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    // 收集本周所有应该完成的任务
    const weekTasks = [];
    const incompleteTasks = [];
    
    for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
        const dateStr = window.utils.toDateString(d);
        const dayOfWeek = d.getDay();
        const dayOfMonth = d.getDate();
        
        // 检查日期是否在项目周期内
        if (dateStr < project.startDate || dateStr > project.endDate) continue;
        
        (project.tasks || []).forEach(task => {
            // 跳过复盘任务
            if (task.isReview) return;
            
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
            }
            
            if (shouldShow) {
                const taskRecord = {
                    ...task,
                    date: dateStr,
                    dateDisplay: `${d.getMonth() + 1}/${d.getDate()}`,
                    isCompleted: window.appData.taskCompletions?.[task.id]?.includes(dateStr) || false
                };
                
                weekTasks.push(taskRecord);
                
                if (!taskRecord.isCompleted) {
                    incompleteTasks.push(taskRecord);
                }
            }
        });
    }
    
    // 计算统计数据
    const totalCount = weekTasks.length;
    const completedCount = weekTasks.filter(t => t.isCompleted).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // 更新UI
    document.getElementById('review-completion-rate').textContent = `${completionRate}%`;
    document.getElementById('review-completed-count').textContent = completedCount;
    document.getElementById('review-total-count').textContent = totalCount;
    
    // 渲染未完成任务列表
    const incompleteTasksDiv = document.getElementById('review-incomplete-tasks');
    
    if (incompleteTasks.length === 0) {
        incompleteTasksDiv.innerHTML = `
            <div class="text-center py-4 text-green-600 font-medium">
                🎉 太棒了！本周所有任务都已完成！
            </div>
        `;
    } else {
        incompleteTasksDiv.innerHTML = `
            <div class="border-t pt-3">
                <h4 class="text-sm font-medium text-gray-700 mb-2">⚠️ 未完成任务 (${incompleteTasks.length}个)</h4>
                <ul class="space-y-2 max-h-40 overflow-y-auto">
                    ${incompleteTasks.map(task => `
                        <li class="text-sm flex items-start space-x-2 text-gray-600">
                            <span class="text-red-500 mt-0.5">•</span>
                            <div class="flex-1">
                                <span class="font-medium">${task.text}</span>
                                <span class="text-gray-400 ml-2">(${task.dateDisplay})</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
}

// 渲染历史记录
function renderReviewHistory(reviews) {
    const historyList = document.getElementById('review-history-list');
    
    if (!reviews || reviews.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <div class="text-6xl mb-4">📖</div>
                <p>还没有复盘记录</p>
                <p class="text-sm mt-2">开始写下第一篇吧！</p>
            </div>
        `;
        return;
    }
    
    // 按时间倒序排列
    const sortedReviews = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
    
    historyList.innerHTML = sortedReviews.map((review, index) => {
        const moodEmoji = review.mood ? getMoodEmoji(review.mood) : '';
        const content = review.content || formatOldReview(review);
        
        return `
        <div class="bg-amber-50 rounded-lg p-5 border-l-4 border-orange-400 hover:shadow-lg transition-all" style="background-image: repeating-linear-gradient(transparent, transparent 31px, #f59e0b11 31px, #f59e0b11 32px);">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">${moodEmoji || '📝'}</div>
                    <div>
                        <h4 class="font-semibold text-gray-900">第 ${reviews.length - index} 页</h4>
                        <p class="text-sm text-gray-500">${review.date}</p>
                    </div>
                </div>
                <button class="delete-review-btn text-gray-400 hover:text-red-500 transition-colors" data-review-date="${review.date}" title="删除这一页">
                    🗑️
                </button>
            </div>
            <div class="bg-white/60 backdrop-blur-sm rounded p-4 text-gray-700 whitespace-pre-wrap leading-relaxed" style="font-family: 'Segoe UI', 'SF Pro Text', system-ui, -apple-system;">
                ${content}
            </div>
        </div>
    `}).join('');
}

// 获取情绪表情
function getMoodEmoji(mood) {
    const moods = {
        'excited': '😊',
        'calm': '😌',
        'tired': '😓',
        'frustrated': '😤',
        'proud': '🎉'
    };
    return moods[mood] || '';
}

// 格式化旧版本的结构化复盘（向后兼容）
function formatOldReview(review) {
    if (review.content) return review.content;
    
    let text = '';
    if (review.wins) text += `🎉 值得庆祝的事：\n${review.wins}\n\n`;
    if (review.challenges) text += `💪 遇到的挑战：\n${review.challenges}\n\n`;
    if (review.learnings) text += `💡 新的思考：\n${review.learnings}\n\n`;
    if (review.nextSteps) text += `🎯 下周想做的事：\n${review.nextSteps}`;
    
    return text || '（旧版本复盘记录）';
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
        content: formData.get('content'),
        mood: formData.get('mood') || ''
    };
    
    project.reviews.push(newReview);
    
    await window.firebaseUtils.saveData(window.userId, window.appData);
    
    // 清空表单
    reviewJournalForm.reset();
    document.getElementById('selected-mood').value = '';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected-mood'));
    
    // 重新渲染历史记录
    renderReviewHistory(project.reviews);
    
    // 显示成功提示
    showToast('💾 这一页已经保存好了！');
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

// 显示提示（使用共享Toast函数）
function showToast(message) {
    window.utils.showToast(message);
}

// 设置事件监听器
function setupReviewEventListeners() {
    // 表单提交
    reviewJournalForm.addEventListener('submit', saveReview);
    
    // 关闭按钮
    document.getElementById('close-review-journal').addEventListener('click', closeReviewJournal);
    
    // 清空按钮
    document.getElementById('clear-review').addEventListener('click', () => {
        if (confirm('确定要清空当前内容吗？')) {
            reviewJournalForm.reset();
            document.getElementById('selected-mood').value = '';
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected-mood'));
        }
    });
    
    // 情绪选择
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mood-btn')) {
            const mood = e.target.dataset.mood;
            document.getElementById('selected-mood').value = mood;
            
            // 更新选中状态
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected-mood', 'ring-2', 'ring-orange-400');
            });
            e.target.classList.add('selected-mood', 'ring-2', 'ring-orange-400');
        }
    });
    
    // 删除复盘
    document.getElementById('review-history-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-review-btn') || e.target.closest('.delete-review-btn')) {
            const btn = e.target.classList.contains('delete-review-btn') ? e.target : e.target.closest('.delete-review-btn');
            const reviewDate = btn.dataset.reviewDate;
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
