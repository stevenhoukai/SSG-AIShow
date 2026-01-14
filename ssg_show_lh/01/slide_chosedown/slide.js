// Slide: Optional Update (Choose Download)
window.currentSlideRender = function(container) {
    container.innerHTML = '';
    const content = `
        <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white relative">
            <!-- Back Button -->
            <button onclick="const idx = slides.findIndex(s => s.id === 'slide_agenda'); if(idx>=0) loadSlide(idx);" 
                    class="absolute top-8 left-8 z-50 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-2 group shadow-lg hover:shadow-green-500/20">
                <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform duration-300"></i>
                <span class="font-medium tracking-wide">返回目录</span>
            </button>

            <div class="absolute inset-0 bg-[url('slide_cover/assets/dark_bg.jpg')] bg-cover bg-center opacity-20"></div>
            <h2 class="text-4xl font-bold z-10 mb-4">可选更新流程</h2>
            <p class="text-gray-400 z-10">Optional Update / Choose Download Demo</p>
            <div class="mt-8 z-10 space-y-2">
                <div class="flex items-center gap-2">
                    <input type="checkbox" checked class="w-4 h-4 accent-green-500">
                    <span>HD Textures (4GB)</span>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" class="w-4 h-4 accent-green-500">
                    <span>Voice Pack - JP (1GB)</span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = content;

    // Render Bottom Navigation
    if (window.renderBottomNav) {
        window.renderBottomNav(container, 'slide_chosedown');
    }
};
