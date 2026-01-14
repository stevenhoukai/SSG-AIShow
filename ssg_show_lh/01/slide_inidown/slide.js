// Slide: Standard Game Download Process (was Initialize Download)
window.currentSlideRender = function(container) {
    container.innerHTML = '';
    
    // State Management
    let state = {
        status: 'idle', // idle, downloading, paused, error, completed
        stage: 0, // 0: idle, 1: validation, 2: downloading, 3: unpacking, 4: completed
        stageProgress: 0, // 0-100 for current stage
        speed: 0,
        totalSize: 10240, // 10GB
        currentSize: 0,
        errorType: null
    };

    let downloadInterval = null;
    
    // Stage Configuration
    const stages = {
        1: { duration: 5000, label: '正在校验本地文件...', devText: '下载引擎通过校验本地已有的游戏文件，确认需要从远端下载的游戏文件，以及可以复用的游戏文件，初始下载场景下，校验本地文件会比较快' },
        2: { duration: 10000, label: '下载中...', devText: '下载引擎连接到最优的边缘节点，从最近的服务器中下载游戏文件，同步下载进度、下载速度等数据到客户端' },
        3: { duration: 5000, label: '正在释放...', devText: '下载引擎把之前下载到本地的临时文件释放为可以在用户电脑上运行的游戏文件，并且清理本地的临时文件' }
    };

    // Render HTML Structure
    const content = `
        <style>
            @keyframes slideInDownShort {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-title {
                animation: slideInDownShort 0.3s ease-out forwards;
            }
            .animate-subtitle {
                animation: slideInDownShort 0.3s ease-out forwards 0.1s; /* Slight delay for subtitle */
                opacity: 0; /* Start invisible */
            }
        </style>
        <div class="w-full h-full flex flex-col bg-gray-900 text-white relative overflow-hidden">
            <!-- Background -->
            <div class="absolute inset-0 bg-[url('slide_inidown/assets/mb.jpg')] bg-cover bg-center"></div>
            <!-- Strong Overlay for readability -->
            <div class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/90 backdrop-blur-[2px]"></div>
            
            <!-- Back Button -->
            <button onclick="const idx = slides.findIndex(s => s.id === 'slide_agenda'); if(idx>=0) loadSlide(idx);" 
                    class="absolute top-8 left-8 z-50 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group">
                <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                <span class="text-sm">返回目录</span>
            </button>

            <!-- Main Content Grid -->
            <div class="z-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-12 md:p-24 items-center">
                
                <!-- Left Side: Interaction -->
                <div class="flex flex-col space-y-8">
                    <div>
                        <h2 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 animate-title">
                            游戏下载标准流程
                        </h2>
                        <p class="text-gray-400 text-sm mt-1 uppercase tracking-wider animate-subtitle">Standard Game Download Process</p>
                    </div>
                    
                    <!-- Game Card / Status -->
                    <div class="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-6 shadow-xl">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 bg-transparent rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                                <img src="slide_inidown/assets/mblogo.png" class="w-full h-full object-contain" alt="Logo">
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">解限机</h3>
                                <p class="text-gray-400 text-sm">Version 2.0.4</p>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="mb-2 flex justify-between text-sm text-gray-400">
                            <span id="progress-text">0%</span>
                            <span id="size-text">0 GB / 10 GB</span>
                        </div>
                        <div class="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                            <div id="progress-bar" class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-0 transition-all duration-300 ease-out"></div>
                        </div>
                        
                        <div class="flex justify-between items-center mb-6">
                            <span id="speed-text" class="text-cyan-400 font-mono text-sm">0 MB/s</span>
                            <span id="status-text" class="text-gray-400 text-sm">等待下载</span>
                        </div>

                        <!-- Main Action Button -->
                        <button id="action-btn" class="w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-blue-600 hover:bg-blue-500 text-white">
                            下载游戏
                        </button>
                    </div>

                    <!-- Error Simulation Controls -->
                    <div class="grid grid-cols-2 gap-4">
                        <button id="sim-disk-btn" class="px-4 py-2 bg-red-900/30 border border-red-800/50 rounded hover:bg-red-900/50 text-red-300 text-sm transition-colors">
                            <i class="fa-solid fa-hard-drive mr-2"></i>模拟磁盘不足
                        </button>
                        <button id="sim-net-btn" class="px-4 py-2 bg-yellow-900/30 border border-yellow-800/50 rounded hover:bg-yellow-900/50 text-yellow-300 text-sm transition-colors">
                            <i class="fa-solid fa-wifi mr-2"></i>模拟网络错误
                        </button>
                        <button id="sim-finish-btn" class="px-4 py-2 bg-green-900/30 border border-green-800/50 rounded hover:bg-green-900/50 text-green-300 text-sm transition-colors">
                            <i class="fa-solid fa-bolt mr-2"></i>快速下载完成
                        </button>
                        <button id="restart-btn" class="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded hover:bg-gray-700/70 text-gray-300 text-sm transition-colors">
                            <i class="fa-solid fa-rotate-right mr-2"></i>重新开始
                        </button>
                    </div>
                </div>

                <!-- Right Side: Explanation -->
                <div class="h-full flex flex-col justify-center">
                    <div class="bg-black/40 backdrop-blur border border-gray-700/50 rounded-2xl p-8 relative overflow-hidden min-h-[300px]">
                        <div class="absolute top-0 left-0 w-1 h-full bg-blue-500" id="status-indicator-bar"></div>
                        
                        <h3 class="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-terminal text-blue-400"></i> 底层交互逻辑
                        </h3>
                        
                        <div id="explanation-text" class="space-y-4 text-gray-300 font-mono text-sm leading-relaxed">
                            <!-- Dynamic Content -->
                            <p class="opacity-50">// 等待用户操作...</p>
                        </div>

                        <!-- Decorative Code Background -->
                        <div class="absolute -bottom-4 -right-4 text-8xl text-white/5 rotate-12 pointer-events-none">
                            <i class="fa-solid fa-code"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = content;

    // Logic Implementation
    const actionBtn = container.querySelector('#action-btn');
    const progressBar = container.querySelector('#progress-bar');
    const progressText = container.querySelector('#progress-text');
    const sizeText = container.querySelector('#size-text');
    const speedText = container.querySelector('#speed-text');
    const statusText = container.querySelector('#status-text');
    const explanationText = container.querySelector('#explanation-text');
    const statusBar = container.querySelector('#status-indicator-bar');

    const simDiskBtn = container.querySelector('#sim-disk-btn');
    const simNetBtn = container.querySelector('#sim-net-btn');
    const simFinishBtn = container.querySelector('#sim-finish-btn');
    const restartBtn = container.querySelector('#restart-btn');

    // Update UI based on state
    function updateUI() {
        // Progress Bar
        progressBar.style.width = `${state.stageProgress}%`;
        progressText.textContent = `${state.stageProgress.toFixed(1)}%`;
        
        // Dynamic Text based on Stage
        if (state.stage === 2) {
             sizeText.textContent = `${(state.currentSize / 1024).toFixed(2)} GB / ${(state.totalSize / 1024).toFixed(2)} GB`;
             speedText.textContent = state.status === 'downloading' ? `${state.speed} MB/s` : '0 MB/s';
        } else {
             sizeText.textContent = '';
             speedText.textContent = '';
        }

        // Button & Status
        if (state.status === 'idle') {
            actionBtn.innerHTML = '下载游戏';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-blue-600 hover:bg-blue-500 text-white';
            statusText.textContent = '等待下载';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-gray-500';
            explanationText.innerHTML = `
                <p class="text-gray-400"><span class="text-blue-400">Client:</span> Ready.</p>
                <p class="text-gray-500">// 等待用户发起下载请求</p>
            `;
        } else if (state.status === 'completed') {
            actionBtn.innerHTML = '<i class="fa-solid fa-play mr-2"></i>开始游戏';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-green-600 hover:bg-green-500 text-white';
            statusText.textContent = '下载完成';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
            explanationText.innerHTML = `
                <p class="text-green-400"><i class="fa-solid fa-check"></i> All Stages Complete</p>
                <p class="text-gray-400 ml-4">Ready to Launch</p>
            `;
        } else if (state.status === 'downloading') {
            actionBtn.innerHTML = '<i class="fa-solid fa-pause mr-2"></i>下载中';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-yellow-600 hover:bg-yellow-500 text-white';
            
            const currentStageConfig = stages[state.stage];
            statusText.textContent = currentStageConfig ? currentStageConfig.label : 'Processing...';
            
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
            
            // Dev Text
            let devHtml = `<p class="text-blue-400 font-bold mb-2">Stage ${state.stage}/3: ${state.stage === 1 ? 'Validation' : state.stage === 2 ? 'Download' : 'Unpacking'}</p>`;
            devHtml += `<p class="text-gray-300 leading-relaxed">${currentStageConfig ? currentStageConfig.devText : ''}</p>`;
            
            if (state.stage === 2) {
                 devHtml += `<p class="text-gray-400 mt-2 font-mono text-xs">Speed: ${state.speed} MB/s | Progress: ${state.stageProgress.toFixed(1)}%</p>`;
            }
            
            explanationText.innerHTML = devHtml;

        } else if (state.status === 'paused') {
            actionBtn.innerHTML = '继续下载';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-blue-600 hover:bg-blue-500 text-white';
            statusText.textContent = '已暂停';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-yellow-500';
            explanationText.innerHTML = `
                <p><span class="text-yellow-400">Info:</span> 用户触发暂停 (Stage ${state.stage})</p>
                <p class="text-gray-400 ml-4">保存当前断点...</p>
            `;
        } else if (state.status === 'error') {
            actionBtn.innerHTML = '重试';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-red-600 hover:bg-red-500 text-white';
            statusText.textContent = state.errorType === 'disk' ? '磁盘空间不足' : '网络连接错误';
            statusText.className = 'text-red-400 text-sm font-bold';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
            
            explanationText.innerHTML = `
                <p class="text-red-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> Error in Stage ${state.stage}</p>
                <p class="text-gray-400 ml-4">${state.errorType === 'disk' ? 'Disk Full' : 'Network Timeout'}</p>
            `;
        }
    }

    // Simulation Loop
    function startSimulation() {
        if (downloadInterval) clearInterval(downloadInterval);
        
        if (state.status === 'idle') {
            state.stage = 1;
            state.stageProgress = 0;
        }
        
        state.status = 'downloading';
        state.errorType = null;
        statusText.className = 'text-gray-400 text-sm'; // Reset text color
        updateUI();

        const tickRate = 100; // ms

        downloadInterval = setInterval(() => {
            if (state.status !== 'downloading') return;

            const currentConfig = stages[state.stage];
            if (!currentConfig) return;

            // Calculate increment based on duration
            const increment = (tickRate / currentConfig.duration) * 100;
            state.stageProgress += increment;
            
            // Simulate speed for Stage 2
            if (state.stage === 2) {
                state.speed = Math.floor(Math.random() * 15) + 5;
                // Update currentSize for display (fake calculation)
                state.currentSize = (state.stageProgress / 100) * state.totalSize;
            }

            if (state.stageProgress >= 100) {
                state.stageProgress = 100;
                // Transition to next stage
                if (state.stage < 3) {
                    state.stage++;
                    state.stageProgress = 0;
                } else {
                    state.status = 'completed';
                    clearInterval(downloadInterval);
                }
            }
            updateUI();
        }, tickRate);
    }

    function pauseSimulation() {
        state.status = 'paused';
        if (downloadInterval) clearInterval(downloadInterval);
        updateUI();
    }

    function triggerError(type) {
        state.status = 'error';
        state.errorType = type;
        if (downloadInterval) clearInterval(downloadInterval);
        updateUI();
    }

    function fastFinish() {
        if (downloadInterval) clearInterval(downloadInterval);
        state.stage = 4; // Completed
        state.stageProgress = 100;
        state.status = 'completed';
        state.errorType = null;
        updateUI();
    }

    function restartSimulation() {
        if (downloadInterval) clearInterval(downloadInterval);
        state.status = 'idle';
        state.stage = 0;
        state.stageProgress = 0;
        state.currentSize = 0;
        state.errorType = null;
        startSimulation();
    }

    // Event Listeners
    actionBtn.onclick = () => {
        if (state.status === 'idle' || state.status === 'paused' || state.status === 'error') {
            startSimulation();
        } else if (state.status === 'downloading') {
            pauseSimulation();
        } else if (state.status === 'completed') {
            alert('启动游戏！');
        }
    };

    simDiskBtn.onclick = () => triggerError('disk');
    simNetBtn.onclick = () => triggerError('network');
    simFinishBtn.onclick = () => fastFinish();
    restartBtn.onclick = () => restartSimulation();

    // Initial Render
    updateUI();

    // Render Bottom Navigation
    if (window.renderBottomNav) {
        window.renderBottomNav(container, 'slide_inidown');
    }
};
