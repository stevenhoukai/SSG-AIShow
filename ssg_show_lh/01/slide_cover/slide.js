// Slide: Cover
// This script renders the content for the cover slide

window.currentSlideRender = function (container) {
    // Clear container
    container.innerHTML = '';

    // Create content using Template Literals for HTML
    const content = `
        <div class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white">
            
            <!-- Background Video -->
            <div class="absolute inset-0 z-0">
                <video id="cover-bg-video" class="w-full h-full object-cover" autoplay muted loop playsinline>
                    <source src="slide_cover/assets/bgmovie.mp4" type="video/mp4">
                </video>
                <!-- Gradient Overlay to highlight center content -->
                <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>
                <div class="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
            </div>

            <!-- Main Content -->
            <div class="z-10 flex flex-col items-center space-y-8 p-8 animate-fade-in-up w-full max-w-4xl">
                
                <!-- Logo -->
                <div class="mb-6">
                    <img src="slide_cover/assets/logo.png" alt="Seasun Logo" class="h-16 md:h-24 drop-shadow-2xl filter brightness-110">
                </div>

                <!-- Title -->
                <h1 class="text-5xl md:text-7xl font-bold tracking-wide text-center drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
                    游戏下载流程演示
                </h1>
                
                <!-- Subtitle -->
                <p class="text-xl md:text-2xl text-gray-200 font-light tracking-[0.2em] uppercase border-b border-white/30 pb-4">
                    Game Download Process Demo
                </p>

                <!-- Button -->
                <div class="mt-16">
                    <button onclick="nextSlide()" class="group relative px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-full overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_rgba(234,88,12,0.8)] transition-all duration-300 transform hover:scale-105 active:scale-95">
                        <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out skew-x-12"></div>
                        <span class="relative text-xl font-bold tracking-widest text-white flex items-center gap-2">
                            立即体验 <i class="fa-solid fa-chevron-right text-sm group-hover:translate-x-1 transition-transform"></i>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="absolute bottom-8 text-gray-400 text-sm z-10 font-mono opacity-60">
                Press <span class="px-2 py-1 bg-white/10 rounded border border-white/20 mx-1">Space</span> to start
            </div>
        </div>
    `;

    container.innerHTML = content;

    // Set video playback rate to be slow
    const video = document.getElementById('cover-bg-video');
    if (video) {
        video.playbackRate = 0.5; // Slow down to 50% speed
    }

    // Add Animations using Motion One (if loaded)
    if (window.animate) {
        window.animate(
            'h1',
            { y: [30, 0], opacity: [0, 1] },
            { duration: 1, easing: 'ease-out' }
        );
        window.animate(
            'p',
            { y: [20, 0], opacity: [0, 1] },
            { duration: 1, delay: 0.3, easing: 'ease-out' }
        );
        window.animate(
            'button',
            { scale: [0.8, 1], opacity: [0, 1] },
            { duration: 0.6, delay: 0.6, easing: 'spring(1, 80, 10, 0)' }
        );
    }
};
