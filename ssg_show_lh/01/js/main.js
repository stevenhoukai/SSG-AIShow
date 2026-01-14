// Configuration: List of slides in order
const slides = [
    { id: 'slide_cover', title: '封面 (Cover)' },
    { id: 'slide_agenda', title: '目录 (Agenda)' },
    { id: 'slide_inidown', title: '初始化下载 (Init)' },
    { id: 'slide_normal', title: '普通流程 (Normal)' },
    { id: 'slide_predown', title: '预下载 (Pre-download)' },
    { id: 'slide_chosedown', title: '可选更新 (Optional)' },
    { id: 'slide_milestone', title: '里程碑 (Milestone)' }
];

// Agenda Items Configuration (Shared)
const agendaItems = [
    { id: 'slide_inidown', title: '初始下载', sub: 'Initial Download', icon: 'fa-download', color: 'cyan' },
    { id: 'slide_normal', title: '普通更新', sub: 'Normal Process', icon: 'fa-play', color: 'blue' },
    { id: 'slide_predown', title: '预下载更新', sub: 'Pre-download', icon: 'fa-clock', color: 'purple' },
    { id: 'slide_chosedown', title: '可选更新', sub: 'Optional Update', icon: 'fa-list-check', color: 'green' }
];

let currentIndex = 0;
const slideContainer = document.getElementById('current-slide');
const drawer = document.getElementById('overview-drawer');
const drawerToggle = document.getElementById('drawer-toggle');
const slideList = document.getElementById('slide-list');

// Helper: Render Bottom Navigation
window.renderBottomNav = function(container, currentSlideId) {
    const navContainer = document.createElement('div');
    navContainer.className = 'absolute bottom-0 left-0 w-full z-40 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-4 transition-transform duration-500 translate-y-full animate-slide-up';
    
    // Filter out current item
    const items = agendaItems.filter(item => item.id !== currentSlideId);
    
    items.forEach(item => {
        const btn = document.createElement('div');
        btn.className = `group flex items-center gap-3 px-5 py-3 bg-gray-900/60 backdrop-blur border border-gray-700 rounded-full cursor-pointer hover:bg-gray-800 hover:border-${item.color}-500/50 transition-all duration-300 hover:-translate-y-1`;
        btn.onclick = () => {
            // Simple transition effect could be added here
            const idx = slides.findIndex(s => s.id === item.id);
            if(idx >= 0) loadSlide(idx);
        };
        
        btn.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-${item.color}-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i class="fa-solid ${item.icon} text-${item.color}-400 text-sm"></i>
            </div>
            <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-200 group-hover:text-${item.color}-300">${item.title}</span>
                <span class="text-[10px] text-gray-500 uppercase tracking-wider">${item.sub}</span>
            </div>
        `;
        navContainer.appendChild(btn);
    });

    container.appendChild(navContainer);
    
    // Add animation class style if not exists
    if (!document.getElementById('anim-style-nav')) {
        const style = document.createElement('style');
        style.id = 'anim-style-nav';
        style.textContent = `
            @keyframes slide-up {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-up {
                animation: slide-up 0.5s ease-out forwards 0.5s; /* Delay to let page load */
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
function init() {
    renderSlideList();
    loadSlide(currentIndex);
    setupEventListeners();
}

// Render the list of slides in the drawer
function renderSlideList() {
    slideList.innerHTML = '';
    slides.forEach((slide, index) => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors text-sm';
        item.textContent = slide.title;
        item.onclick = () => {
            loadSlide(index);
            toggleDrawer(false);
        };
        slideList.appendChild(item);
    });
}

// Load a specific slide
async function loadSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    currentIndex = index;
    const slideId = slides[index].id;
    
    // Clear current content
    slideContainer.innerHTML = '';
    
    // Dynamic import of the slide's logic
    // Note: In a real server environment, we could use import(). 
    // For local file system (file://), modules might be restricted.
    // We'll use a script tag injection approach for broad compatibility or assume a local server.
    
    try {
        // Remove old slide scripts if any (optional cleanup)
        
        // Load the script
        const scriptUrl = `${slideId}/slide.js`;
        
        // We assume the slide.js defines a global function or executes immediately to render.
        // To keep it clean, let's assume slide.js attaches a 'renderSlide' function to window 
        // or we use a convention.
        // Let's try to fetch the text and eval it, or append script.
        // Appending script is safer.
        
        // First, remove previous slide specific styles/scripts if we were tracking them.
        // For this MVP, we just append.
        
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = () => {
            // We assume the script calls a global function or registers itself.
            // Let's establish a protocol: slide.js should call `window.renderCurrentSlide(container)`
            // But since we are loading it dynamically, maybe it just runs.
            // Let's assume slide.js exports a `render` function that we can call if we used modules.
            // Since we are using vanilla, let's assume slide.js assigns `window.currentSlideRender`
            
            if (typeof window.currentSlideRender === 'function') {
                window.currentSlideRender(slideContainer);
            }
        };
        // Reset the render function before loading new one
        window.currentSlideRender = null;
        
        document.body.appendChild(script);
        
        // Update URL hash (optional)
        window.location.hash = slideId;
        
    } catch (e) {
        console.error('Failed to load slide:', e);
        slideContainer.innerHTML = `<div class="flex items-center justify-center h-full text-red-500">Error loading ${slideId}</div>`;
    }
}

// Navigation Logic
function nextSlide() {
    if (currentIndex < slides.length - 1) {
        loadSlide(currentIndex + 1);
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        loadSlide(currentIndex - 1);
    }
}

function toggleDrawer(show) {
    if (show === undefined) {
        drawer.classList.toggle('-translate-x-full');
    } else if (show) {
        drawer.classList.remove('-translate-x-full');
    } else {
        drawer.classList.add('-translate-x-full');
    }
}

// Event Listeners
function setupEventListeners() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Space
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                prevSlide();
                break;
        }
    });

    // Buttons
    document.getElementById('next-btn').onclick = nextSlide;
    document.getElementById('prev-btn').onclick = prevSlide;
    drawerToggle.onclick = () => toggleDrawer();
}

// Start
init();
