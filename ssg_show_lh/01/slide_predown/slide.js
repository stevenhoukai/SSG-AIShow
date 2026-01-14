// Slide: Pre-download Process
window.currentSlideRender = function(container) {
    container.innerHTML = '';
    const content = `
        <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white relative">
            <!-- Back Button -->
            <button onclick="const idx = slides.findIndex(s => s.id === 'slide_agenda'); if(idx>=0) loadSlide(idx);" 
                    class="absolute top-8 left-8 z-50 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-2 group shadow-lg hover:shadow-purple-500/20">
                <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform duration-300"></i>
                <span class="font-medium tracking-wide">返回目录</span>
            </button>

            <!-- Background -->
            <div class="absolute inset-0 bg-[url('slide_predown/assets/cbjqkv.png')] bg-cover bg-center"></div>
            <!-- Strong Overlay for readability -->
            <div class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/90 backdrop-blur-[2px]"></div>
            <h2 class="text-4xl font-bold z-10 mb-4">预下载流程</h2>
            <p class="text-gray-400 z-10">Pre-download Process Demo</p>
            <div class="mt-8 z-10 flex items-center gap-4">
                <i class="fa-solid fa-cloud-arrow-down text-4xl text-purple-500"></i>
                <span class="text-xl">Pre-download Available</span>
            </div>
        </div>
    `;
    container.innerHTML = content;

    // Render Bottom Navigation
    if (window.renderBottomNav) {
        window.renderBottomNav(container, 'slide_predown');
    }
};
