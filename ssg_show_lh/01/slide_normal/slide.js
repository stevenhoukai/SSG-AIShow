// Slide: Normal Update Process
window.currentSlideRender = function(container) {
    container.innerHTML = '';
    
    // State Management
    let state = {
        status: 'idle', // idle, downloading, paused, error
        progress: 0,
        speed: 0,
        totalSize: 2048, // 2GB for update
        currentSize: 0,
        errorType: null
    };

    let downloadInterval = null;

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
            /* Flowchart Styles */
            .node rect { transition: all 0.3s ease; }
            .node text { transition: all 0.3s ease; font-family: monospace; }
            .node.active rect { fill: #2563eb; stroke: #60a5fa; stroke-width: 2; filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.5)); }
            .node.active text { fill: #fff; font-weight: bold; }
            .node.error rect { fill: #dc2626; stroke: #f87171; }
            .node.paused rect { fill: #ca8a04; stroke: #facc15; }
            .node.success rect { fill: #16a34a; stroke: #4ade80; }
            
            .path { transition: all 0.3s ease; stroke: #4b5563; stroke-width: 2; fill: none; }
            .path.active { stroke: #60a5fa; stroke-width: 3; filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.5)); animation: dash 1s linear infinite; stroke-dasharray: 10; }
            .path.error { stroke: #f87171; }
            .path.paused { stroke: #facc15; }
            .path.success { stroke: #4ade80; }

            @keyframes dash {
                to { stroke-dashoffset: -20; }
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
                            游戏普通更新流程
                        </h2>
                        <p class="text-gray-400 text-sm mt-1 uppercase tracking-wider animate-subtitle">Standard Game Update Process</p>
                    </div>
                    
                    <!-- Game Card / Status -->
                    <div class="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-6 shadow-xl">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 bg-transparent rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                                <img src="slide_inidown/assets/mblogo.png" class="w-full h-full object-contain" alt="Logo">
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">解限机</h3>
                                <p class="text-gray-400 text-sm">Update to Version 2.1.0</p>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="mb-2 flex justify-between text-sm text-gray-400">
                            <span id="progress-text">0%</span>
                            <span id="size-text">0 GB / 2.00 GB</span>
                        </div>
                        <div class="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                            <div id="progress-bar" class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-0 transition-all duration-300 ease-out"></div>
                        </div>
                        <div class="flex justify-between items-center mb-6">
                            <span id="speed-text" class="text-cyan-400 font-mono text-sm">0 MB/s</span>
                            <span id="status-text" class="text-gray-400 text-sm">等待更新</span>
                        </div>

                        <!-- Main Action Button -->
                        <button id="action-btn" class="w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-green-600 hover:bg-green-500 text-white">
                            更新游戏
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
                        <button id="sim-finish-btn" class="col-span-2 px-4 py-2 bg-green-900/30 border border-green-800/50 rounded hover:bg-green-900/50 text-green-300 text-sm transition-colors">
                            <i class="fa-solid fa-bolt mr-2"></i>快速更新完成
                        </button>
                    </div>
                </div>

                <!-- Right Side: Explanation -->
                <div class="h-full flex flex-col justify-center">
                    <div class="bg-black/40 backdrop-blur border border-gray-700/50 rounded-2xl p-4 relative overflow-hidden min-h-[400px] flex items-center justify-center">
                        <div class="absolute top-0 left-0 w-1 h-full bg-blue-500" id="status-indicator-bar"></div>
                        
                        <div class="absolute top-4 left-6 z-10">
                            <h3 class="text-xl font-bold text-gray-200 flex items-center gap-2">
                                <i class="fa-solid fa-diagram-project text-blue-400"></i> 更新逻辑视图
                            </h3>
                        </div>
                        
                        <div id="flowchart-container" class="w-full h-full pt-12">
                            <svg viewBox="0 0 400 500" class="w-full h-full" style="max-height: 500px;">
                                <defs>
                                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L9,3 z" fill="#4b5563" />
                                    </marker>
                                    <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
                                    </marker>
                                </defs>

                                <!-- Paths -->
                                <path id="path-start-check" class="path" d="M200 50 L200 90" marker-end="url(#arrow)" />
                                <path id="path-check-dl" class="path" d="M200 130 L200 170" marker-end="url(#arrow)" />
                                
                                <!-- Error Path -->
                                <path id="path-dl-error" class="path" d="M250 195 L320 195" marker-end="url(#arrow)" stroke-dasharray="4" />
                                <path id="path-error-retry" class="path" d="M320 220 L320 260 L220 260 L220 220" marker-end="url(#arrow)" />

                                <!-- Pause Path -->
                                <path id="path-dl-pause" class="path" d="M150 195 L80 195" marker-end="url(#arrow)" stroke-dasharray="4" />
                                <path id="path-pause-resume" class="path" d="M80 220 L80 260 L180 260 L180 220" marker-end="url(#arrow)" />

                                <path id="path-dl-verify" class="path" d="M200 220 L200 300" marker-end="url(#arrow)" />
                                <path id="path-verify-finish" class="path" d="M200 340 L200 400" marker-end="url(#arrow)" />

                                <!-- Nodes -->
                                <g id="node-start" class="node">
                                    <rect x="150" y="10" width="100" height="40" rx="20" fill="#1f2937" stroke="#374151" />
                                    <text x="200" y="35" text-anchor="middle" fill="#9ca3af" font-size="12">开始更新</text>
                                </g>

                                <g id="node-check" class="node">
                                    <rect x="140" y="90" width="120" height="40" rx="4" fill="#1f2937" stroke="#374151" />
                                    <text x="200" y="115" text-anchor="middle" fill="#9ca3af" font-size="12">版本/空间检查</text>
                                </g>

                                <g id="node-download" class="node">
                                    <rect x="140" y="170" width="120" height="50" rx="4" fill="#1f2937" stroke="#374151" />
                                    <text x="200" y="200" text-anchor="middle" fill="#9ca3af" font-size="12">下载/写入分片</text>
                                </g>

                                <g id="node-error" class="node">
                                    <rect x="280" y="180" width="80" height="40" rx="4" fill="#1f2937" stroke="#374151" />
                                    <text x="320" y="205" text-anchor="middle" fill="#9ca3af" font-size="12">错误处理</text>
                                </g>

                                <g id="node-paused" class="node">
                                    <rect x="40" y="180" width="80" height="40" rx="4" fill="#1f2937" stroke="#374151" />
                                    <text x="80" y="205" text-anchor="middle" fill="#9ca3af" font-size="12">暂停状态</text>
                                </g>

                                <g id="node-verify" class="node">
                                    <rect x="140" y="300" width="120" height="40" rx="4" fill="#1f2937" stroke="#374151" />
                                    <text x="200" y="325" text-anchor="middle" fill="#9ca3af" font-size="12">校验合并</text>
                                </g>

                                <g id="node-finish" class="node">
                                    <rect x="150" y="400" width="100" height="40" rx="20" fill="#1f2937" stroke="#374151" />
                                    <text x="200" y="425" text-anchor="middle" fill="#9ca3af" font-size="12">更新完成</text>
                                </g>
                            </svg>
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
    const statusBar = container.querySelector('#status-indicator-bar');

    const simDiskBtn = container.querySelector('#sim-disk-btn');
    const simNetBtn = container.querySelector('#sim-net-btn');
    const simFinishBtn = container.querySelector('#sim-finish-btn');

    // Flowchart Helper
    function updateFlowchart(state) {
        // Reset all
        container.querySelectorAll('.node').forEach(el => el.classList.remove('active', 'error', 'paused', 'success'));
        container.querySelectorAll('.path').forEach(el => {
            el.classList.remove('active', 'error', 'paused', 'success');
            el.setAttribute('marker-end', 'url(#arrow)');
        });

        const activate = (id, type = 'active') => {
            const el = container.querySelector(`#${id}`);
            if(el) el.classList.add(type);
        };
        const activatePath = (id, type = 'active') => {
            const el = container.querySelector(`#${id}`);
            if(el) {
                el.classList.add(type);
                if(type === 'active') el.setAttribute('marker-end', 'url(#arrow-active)');
            }
        };

        if (state.status === 'idle') {
            activate('node-start');
        } else if (state.status === 'downloading') {
            activate('node-start');
            activatePath('path-start-check');
            activate('node-check');
            activatePath('path-check-dl');
            activate('node-download');
            
            // Simulate loop animation or just highlight
        } else if (state.status === 'paused') {
            activate('node-paused', 'paused');
            activatePath('path-dl-pause', 'paused');
        } else if (state.status === 'error') {
            activate('node-error', 'error');
            activatePath('path-dl-error', 'error');
        } else if (state.status === 'completed') {
            activate('node-start');
            activate('node-check');
            activate('node-download');
            activatePath('path-dl-verify');
            activate('node-verify');
            activatePath('path-verify-finish');
            activate('node-finish', 'success');
        }
    }

    // Update UI based on state
    function updateUI() {
        // Progress
        const pct = (state.currentSize / state.totalSize) * 100;
        progressBar.style.width = `${pct}%`;
        progressText.textContent = `${pct.toFixed(1)}%`;
        sizeText.textContent = `${(state.currentSize / 1024).toFixed(2)} GB / ${(state.totalSize / 1024).toFixed(2)} GB`;
        speedText.textContent = state.status === 'downloading' ? `${state.speed} MB/s` : '0 MB/s';

        updateFlowchart(state);

        // Button & Status
        if (state.status === 'idle') {
            actionBtn.textContent = '更新游戏';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-green-600 hover:bg-green-500 text-white';
            statusText.textContent = '等待更新';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-gray-500';
        } else if (state.status === 'completed') {
            actionBtn.textContent = '开始游戏';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-green-600 hover:bg-green-500 text-white';
            statusText.textContent = '更新完成';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
        } else if (state.status === 'downloading') {
            actionBtn.textContent = '暂停';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-yellow-600 hover:bg-yellow-500 text-white';
            statusText.textContent = '正在更新...';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
        } else if (state.status === 'paused') {
            actionBtn.textContent = '继续更新';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-green-600 hover:bg-green-500 text-white';
            statusText.textContent = '已暂停';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-yellow-500';
        } else if (state.status === 'error') {
            actionBtn.textContent = '重试';
            actionBtn.className = 'w-full py-3 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-lg bg-red-600 hover:bg-red-500 text-white';
            statusText.textContent = state.errorType === 'disk' ? '磁盘空间不足' : '网络连接错误';
            statusText.className = 'text-red-400 text-sm font-bold';
            statusBar.className = 'absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        }
    }

    // Simulation Loop
    function startSimulation() {
        if (downloadInterval) clearInterval(downloadInterval);
        state.status = 'downloading';
        state.errorType = null;
        statusText.className = 'text-gray-400 text-sm'; // Reset text color
        updateUI();

        downloadInterval = setInterval(() => {
            if (state.status !== 'downloading') return;

            // Simulate speed fluctuation
            state.speed = Math.floor(Math.random() * 15) + 5; // 5-20 MB/s
            state.currentSize += state.speed / 10; // Add chunk

            if (state.currentSize >= state.totalSize) {
                state.currentSize = state.totalSize;
                state.status = 'completed';
                state.progress = 100;
                clearInterval(downloadInterval);
            }
            updateUI();
        }, 100);
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
        state.currentSize = state.totalSize;
        state.progress = 100;
        state.status = 'completed';
        state.errorType = null;
        updateUI();
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

    // Initial Render
    updateUI();

    // Render Bottom Navigation
    if (window.renderBottomNav) {
        window.renderBottomNav(container, 'slide_normal');
    }
};
