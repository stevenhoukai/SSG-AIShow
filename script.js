import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// === 配置与状态 ===
const config = {
    particleCount: 15000,
    particleSize: 0.05,
    color: '#00ffff',
    shape: 'saturn'
};

const state = {
    currentScale: 1.0,
    wheelScale: 1.0,
    handScale: 1.0,
    gestureDetected: false
};

// === Three.js 全局变量 ===
let scene, camera, renderer;
let particles, particleGeometry, particleMaterial;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-999, -999);

// 存储所有的“超链接粒子”对象
// 结构: { position: Vector3, element: HTMLElement, particle: THREE.Sprite, url: string, basePos: Vector3 }
let specialParticles = [];

// 流星雨全局变量
let starGeo, stars;
const STAR_COUNT = 10000; // Increased for dense universe field

let initialPositions = []; // 存储当前形状的目标位置
let currentPositions = []; // 存储当前粒子的实际位置（用于动画过渡）
let time = 0;

// === 初始化 ===
initThree();
initMeteorShower(); // Add meteor shower initialization
initParticles();
initEvents();
initMediaPipe();
animate();

function initThree() {
    const container = document.getElementById('canvas-container');

    // 场景
    scene = new THREE.Scene();
    // 增加一点雾效做深度感 - 深邃黑
    scene.fog = new THREE.FogExp2(0x000000, 0.002); // Reduced density for clearer distance

    // 相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000); // Further view
    camera.position.z = 5;

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 响应窗口大小变化
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// === 背景流星雨 ===
function initMeteorShower() {
    starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starVelocities = []; // Store velocities for animation

    for (let i = 0; i < STAR_COUNT; i++) {
        // Spread stars widely - Vast Universe
        starPositions[i * 3] = (Math.random() - 0.5) * 2000; // x: wider range
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000; // y
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000 - 500; // z depth

        starVelocities.push({
            speed: 0.2 + Math.random() * 0.5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2 // Diagonal movement
        });
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    // Create a simple streak texture or just use points
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7, // Slightly distinct stars
        transparent: true,
        opacity: 0.8
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);
}

function animateMeteors() {
    if (!stars) return;

    // Calculate dynamic speed based on time
    // Combines slow waves and fast jitters for "arbitrary" feel
    // base speed + slow variation + fast variation
    // Using Math.pow to make "fast" moments more intense (warp speed effect)
    const wave1 = Math.sin(time * 0.5); // Slow cycle
    const wave2 = Math.sin(time * 3.0); // Fast cycle

    // Map -1..1 to something positive. 
    // We want speed to fluctuate between say 0.5 (slow drift) and 8.0 (fast rush)
    let speedMultiplier = 1.0 + wave1 * 0.5 + wave2 * 0.3;

    // Occasionally burst very fast
    if (Math.sin(time * 0.2) > 0.8) {
        speedMultiplier *= 8.0; // Higher warp speed
    }

    const currentSpeed = 5.0 * speedMultiplier; // Base speed faster

    const positions = starGeo.attributes.position.array;
    for (let i = 0; i < STAR_COUNT; i++) {
        // Simple meteor shower movement: Z axis or Diagonal
        // Let's make them move towards camera for a "warp speed" feel or diagonally for "shower"

        // Z movement (Warp speed style)
        positions[i * 3 + 2] += currentSpeed; // Move towards camera

        // Reset if passed camera (+ a buffer behind camera)
        if (positions[i * 3 + 2] > 200) {
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 2] = -1800; // Reset far back
        }
    }
    starGeo.attributes.position.needsUpdate = true;
    stars.rotation.z -= 0.0002; // Very slow spin of the universe
}

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Core
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);

    // Parse color for gradient steps
    // Subtle glow instead of intense burst
    gradient.addColorStop(0, 'rgba(200, 255, 255, 1)'); // Brighter core
    gradient.addColorStop(0.2, 'rgba(0, 255, 255, 0.8)'); // Strong cyan inner ring
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// === 粒子系统 ===
function initParticles() {
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);

    // 初始位置：随机分布在球体内
    for (let i = 0; i < config.particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = Math.cbrt(Math.random()) * 2; // 球体均匀分布

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        currentPositions.push({
            x: positions[i * 3],
            y: positions[i * 3 + 1],
            z: positions[i * 3 + 2]
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 材质
    // 创建一个圆形纹理
    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

    particleMaterial = new THREE.PointsMaterial({
        color: config.color,
        size: config.particleSize,
        map: sprite,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 清理旧的特殊粒子
    if (specialParticles && specialParticles.length > 0) {
        specialParticles.forEach(sp => {
            scene.remove(sp.particle);
            if (sp.element && sp.element.parentNode) sp.element.parentNode.removeChild(sp.element);
        });
    }
    specialParticles = [];

    // 定义要生成的目标列表
    const targets = [
        { name: '史蒂芬猴', url: 'http://ssg-inner-aishow.seasungames.cn:3000/ssg_show_hk/01/index.html' },
        { name: '震宇', url: '#' },
        { name: '景宇', url: '#' },
        { name: '艾伦', url: '#' },
        { name: '程广', url: '#' }
    ];

    const container = document.getElementById('tech-labels-container');
    const glowTexture = createGlowTexture();
    const specialMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x00ffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    targets.forEach((target, index) => {
        // 使用 Fibonacci Sphere 分布来防止位置重叠
        // 索引加个偏移量防止每次都在同一点
        const k = index + 0.5;
        const total = targets.length;
        const phi = Math.acos(1 - 2 * k / total); // 0 到 PI
        const theta = Math.PI * (1 + Math.sqrt(5)) * k; // 黄金角

        // 随机半径，但在 1.2 ~ 1.8 之间，保持在内部空间
        const r = 1.2 + Math.random() * 0.6;

        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);

        // 第一个是史蒂芬猴，强制稍微居中一点但不要完全在正中心
        if (index === 0) {
            x *= 0.2; y *= 0.2; z *= 0.2;
        }

        const basePos = new THREE.Vector3(x, y, z);

        // 创建 Sprite
        const sprite = new THREE.Sprite(specialMaterial.clone());
        sprite.position.copy(basePos);
        sprite.scale.set(0.15, 0.15, 0.15); // Default small size
        sprite.visible = false;
        scene.add(sprite);

        // 创建 DOM
        const div = document.createElement('div');
        div.className = 'tech-label';
        // 使用更简洁的 HTML 结构，添加 data-text 属性用于乱码还原
        div.innerHTML = `<span class="label-content" data-text="${target.name}">${target.name}</span>`;

        // 点击事件绑定
        const link = div.querySelector('.label-content');

        // 乱码效果逻辑
        link.addEventListener('mouseenter', (e) => {
            const targetEl = e.target;
            const originalText = targetEl.getAttribute('data-text');
            const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
            let iterations = 0;

            // 清除可能存在的旧 Interval
            if (targetEl.interval) clearInterval(targetEl.interval);

            targetEl.interval = setInterval(() => {
                targetEl.innerText = originalText
                    .split('')
                    .map((letter, index) => {
                        if (index < iterations) {
                            return originalText[index];
                        }
                        return possibleChars[Math.floor(Math.random() * possibleChars.length)];
                    })
                    .join('');

                if (iterations >= originalText.length) {
                    clearInterval(targetEl.interval);
                }

                iterations += 1 / 3; // 速度控制
            }, 30);
        });

        link.addEventListener('click', (e) => {
            e.stopPropagation();
            if (target.url && target.url !== '#') {
                window.open(target.url, '_blank');
            } else {
                alert(`即将在新窗口打开 ${target.name}`);
            }
        });

        // 允许穿透点击（如果点到文字间隙）
        // style.css 已经设置 tech-label point-events: none, .label-content: auto

        container.appendChild(div);

        specialParticles.push({
            basePos: basePos,
            particle: sprite,
            element: div,
            url: target.url
        });
    });

    // 生成初始形状目标
    updateShapeTarget(config.shape);
}

// 生成不同形状的坐标
function getShapePositions(shapeType) {
    const positions = [];
    const count = config.particleCount;

    for (let i = 0; i < count; i++) {
        let x, y, z;
        const idx = i / count; // 0 到 1

        // 随机种子
        const r1 = Math.random();
        const r2 = Math.random();
        const r3 = Math.random();

        switch (shapeType) {
            case 'heart':
                // 心形公式
                // x = 16sin^3(t)
                // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
                // 这是一个2D心形，我们需要把它扩展成3D
                const t = r1 * Math.PI * 2;
                const h_r = r2; // 内部填充

                // 3D 心形变体
                x = 16 * Math.pow(Math.sin(t), 3);
                y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
                z = (r3 - 0.5) * 5; // 厚度

                // 简单的缩放
                x *= 0.1; y *= 0.1; z *= 0.1;
                break;

            case 'flower':
                // 极坐标玫瑰线 r = cos(k*theta)
                const k = 4; // 花瓣数
                const theta_f = r1 * Math.PI * 2;
                const rad_f = Math.cos(k * theta_f) + 0.5; // 半径
                const phi_f = (r2 - 0.5) * Math.PI; // 3D 偏移

                x = rad_f * Math.cos(theta_f) * 2;
                y = rad_f * Math.sin(theta_f) * 2;
                z = r3 * Math.cos(k * theta_f) * 0.5; // 稍微有些波动的厚度
                break;

            case 'saturn':
                // 土星：球体 + 环
                if (i < count * 0.3) {
                    // 主体球
                    const theta_s = Math.random() * Math.PI * 2;
                    const phi_s = Math.acos((Math.random() * 2) - 1);
                    const rad_s = 1.0;
                    x = rad_s * Math.sin(phi_s) * Math.cos(theta_s);
                    y = rad_s * Math.sin(phi_s) * Math.sin(theta_s);
                    z = rad_s * Math.cos(phi_s);
                } else {
                    // 环
                    const theta_r = Math.random() * Math.PI * 2;
                    const rad_r = 1.5 + Math.random() * 1.5; // 环半径 1.5 - 3.0
                    x = rad_r * Math.cos(theta_r);
                    y = (Math.random() - 0.5) * 0.1; // 环很薄
                    z = rad_r * Math.sin(theta_r);

                    // 倾斜环
                    const tilt = Math.PI / 6;
                    const tempY = y * Math.cos(tilt) - z * Math.sin(tilt);
                    const tempZ = y * Math.sin(tilt) + z * Math.cos(tilt);
                    y = tempY;
                    z = tempZ;
                }
                break;

            case 'buddha':
                // 抽象佛像：身(球) + 头(球) + 腿(扁球)
                const choice = Math.random();
                if (choice < 0.2) {
                    // 头
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const r = 0.5;
                    x = r * Math.sin(phi) * Math.cos(theta);
                    y = r * Math.sin(phi) * Math.sin(theta) + 1.2;
                    z = r * Math.cos(phi);
                } else if (choice < 0.6) {
                    // 躯干
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const r = 0.8;
                    x = r * Math.sin(phi) * Math.cos(theta) * 1.2;
                    y = r * Math.sin(phi) * Math.sin(theta);
                    z = r * Math.cos(phi) * 0.8;
                } else {
                    // 盘腿 (扁椭圆)
                    const theta = Math.random() * Math.PI * 2;
                    const r = 1.5 * Math.sqrt(Math.random());
                    x = r * Math.cos(theta);
                    y = (Math.random() - 0.5) * 0.5 - 0.8;
                    z = r * Math.sin(theta);
                }
                break;

            case 'fireworks':
                // 爆炸发散状
                const theta_fw = Math.random() * Math.PI * 2;
                const phi_fw = Math.acos((Math.random() * 2) - 1);
                const r_fw = Math.random() * 3 + 0.1; // 随机半径
                x = r_fw * Math.sin(phi_fw) * Math.cos(theta_fw);
                y = r_fw * Math.sin(phi_fw) * Math.sin(theta_fw);
                z = r_fw * Math.cos(phi_fw);
                break;

            default:
                x = (r1 - 0.5) * 2;
                y = (r2 - 0.5) * 2;
                z = (r3 - 0.5) * 2;
                break;
        }

        positions.push({ x, y, z });
    }
    return positions;
}

function updateShapeTarget(shapeType) {
    initialPositions = getShapePositions(shapeType);
}

// === 交互事件 ===
function initEvents() {
    // 形状选择
    const shapeSelect = document.getElementById('shape-select');
    shapeSelect.addEventListener('change', (e) => {
        config.shape = e.target.value;
        updateShapeTarget(config.shape);
    });

    // 颜色选择
    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', (e) => {
        config.color = e.target.value;
        particleMaterial.color.set(config.color);
    });

    // Tech Label Click (Moved inside initEvents to avoid redeclaring if not careful, but better to just have one place)
    /* REMOVED: key label logic is now dynamic in initParticles */

    // BGM Control
    const bgmPlayer = document.getElementById('bgm-player');
    const bgmToggle = document.getElementById('bgm-toggle');

    // 尝试播放函数
    const tryPlayBGM = () => {
        // 设置音量适中，以免炸耳
        bgmPlayer.volume = 0.5;
        bgmPlayer.play().then(() => {
            bgmToggle.textContent = '🎵 播放中';
            bgmToggle.classList.remove('off');
        }).catch(err => {
            console.log("Autoplay blocked, waiting for interaction");
            bgmToggle.textContent = '🔇 点击开启音乐';
            bgmToggle.classList.add('off');
        });
    };

    // 页面加载后立即尝试
    tryPlayBGM();

    // 按钮切换
    if (bgmToggle) {
        bgmToggle.addEventListener('click', (e) => {
            if (bgmPlayer.paused) {
                bgmPlayer.play();
                bgmToggle.textContent = '🎵 播放中';
                bgmToggle.classList.remove('off');
            } else {
                bgmPlayer.pause();
                bgmToggle.textContent = '🔇 已暂停';
                bgmToggle.classList.add('off');
            }
        });
    }

    // UI Toggle
    const uiPanel = document.getElementById('ui-panel');
    const uiToggle = document.getElementById('ui-toggle');
    if (uiToggle) {
        uiToggle.addEventListener('click', () => {
            uiPanel.classList.toggle('closed');
        });
    }

    // 鼠标滚轮缩放
    window.addEventListener('wheel', (e) => {
        const speed = 0.001;
        state.wheelScale -= e.deltaY * speed;
        // 限制: 最小 0.1 倍, 最大 5 倍
        state.wheelScale = Math.max(0.1, Math.min(state.wheelScale, 5.0));
    });

    // 鼠标移动检测
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
}



// === MediaPipe Hands ===
function initMediaPipe() {
    const videoElement = document.getElementById('input-video');
    const canvasElement = document.getElementById('output-canvas');
    const canvasCtx = canvasElement.getContext('2d');
    const statusDiv = document.getElementById('camera-status');

    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
        // 绘制调试视图
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        state.gestureDetected = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            state.gestureDetected = true;
            statusDiv.textContent = "🖐️ 手势已识别";
            statusDiv.classList.add('active');

            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });

                // --- 核心逻辑：计算张合度 ---
                // 计算拇指指尖(4)到食指尖(8)的距离，或者所有指尖到掌心(0)的平均距离
                // 这里使用：所有指尖(4, 8, 12, 16, 20) 到 掌心(0) 的平均距离来判断张开程度
                const palm = landmarks[0];
                const tips = [4, 8, 12, 16, 20];
                let totalDist = 0;

                tips.forEach(idx => {
                    const tip = landmarks[idx];
                    const dist = Math.sqrt(
                        Math.pow(tip.x - palm.x, 2) +
                        Math.pow(tip.y - palm.y, 2) +
                        Math.pow(tip.z - palm.z, 2)
                    );
                    totalDist += dist;
                });

                const avgDist = totalDist / 5;

                // 经验阈值：握拳约 < 0.15, 张开约 > 0.35
                const minOpen = 0.15;
                const maxOpen = 0.4;
                const val = Math.max(minOpen, Math.min(avgDist, maxOpen));
                const normalized = (val - minOpen) / (maxOpen - minOpen); // 0.0 ~ 1.0

                // 映射：张开(1.0) -> Scale 2.0; 握紧(0.0) -> Scale 0.5
                state.handScale = 0.5 + normalized * 1.5;

            }
        } else {
            statusDiv.textContent = "📷 等待手势...";
            statusDiv.classList.remove('active');
            // 平滑复位
            state.handScale += (1.0 - state.handScale) * 0.05;
        }
        canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    camera.start();
}

// === 动画循环 ===
function animate() {
    requestAnimationFrame(animate);

    time += 0.01;

    // Update meteors (Background)
    animateMeteors();

    // 计算总目标缩放
    const totalTargetScale = state.wheelScale * state.handScale;

    // 1. 平滑更新状态
    state.currentScale += (totalTargetScale - state.currentScale) * 0.1;

    // 2. 更新粒子位置
    const positions = particleGeometry.attributes.position.array;

    for (let i = 0; i < config.particleCount; i++) {
        const target = initialPositions[i];

        // 基础目标位置
        let tx = target.x * state.currentScale;
        let ty = target.y * state.currentScale;
        let tz = target.z * state.currentScale;

        // 动态效果：添加一些基于时间的波动
        if (config.shape === 'fireworks') {
            const speed = 1.0 + Math.sin(time) * 0.5;
            tx *= speed; ty *= speed; tz *= speed;
        } else if (config.shape === 'heart') {
            const beat = 1 + 0.05 * Math.sin(time * 5);
            tx *= beat; ty *= beat; tz *= beat;
        }

        // 粒子平滑移动到目标位置
        const current = currentPositions[i];
        current.x += (tx - current.x) * 0.05;
        current.y += (ty - current.y) * 0.05;
        current.z += (tz - current.z) * 0.05;

        // 赋值回 geometry
        positions[i * 3] = current.x;
        positions[i * 3 + 1] = current.y;
        positions[i * 3 + 2] = current.z;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // 3. 旋转场景
    particles.rotation.y += 0.002;
    if (config.shape === 'saturn') {
        particles.rotation.z = 0.2;
    } else {
        particles.rotation.z = 0;
    }

    // Update Special Particles & Labels
    const isCorrectShape = config.shape === 'saturn' || config.shape === 'fireworks';

    // Visibility: scale > 1.2 starts showing, 3.5 fully visible
    // Adjusted threshold lower so user can see them easier
    let visibility = 0;
    if (isCorrectShape) {
        visibility = (state.currentScale - 1.2) / 1.5;
        visibility = Math.max(0, Math.min(visibility, 1));
    }

    // Raycast check setup
    // Since special particles are unconnected sprites, we can raycast them.
    raycaster.setFromCamera(mouse, camera);

    specialParticles.forEach(sp => {
        const sprite = sp.particle;
        const div = sp.element;

        if (visibility > 0) {
            sprite.visible = true;
            // Boost opacity so they are definitely seen
            sprite.material.opacity = visibility * 1.0;

            // Basic breathing (Subtle size: slightly larger than 0.05)
            // Make base size slightly larger to ensure visibility (0.2 instead of 0.15)
            let pScale = 0.2 + 0.05 * Math.sin(time * 3 + sprite.id);

            // Interaction: Check Hover
            const intersects = raycaster.intersectObject(sprite);
            let isHovered = intersects.length > 0;

            // Check if label hover should trigger particle
            try {
                const content = div.querySelector('.label-content');
                if (content && content.matches(':hover')) isHovered = true;
            } catch (e) { }

            if (isHovered && visibility > 0.5) {
                // Interactive Scale
                pScale *= 1.5;
                sprite.material.color.set(0xff00ff);
                div.classList.add('hovered');
                document.body.style.cursor = 'pointer';
            } else {
                // Normal pulsing color -> Cyan/White flicker
                // Make flicker more apparent
                const flicker = 0.5 + 0.5 * Math.sin(time * 8 + sprite.id);
                // Color: Cyan (0x00ffff) but interpolating with white/brightness
                // setHSL(h, s, l) -> Cyan is approx 0.5 hue.
                sprite.material.color.setHSL(0.5, 1.0, 0.5 + 0.4 * flicker);
                if (specialParticles.length === 1) document.body.style.cursor = 'default';
            }

            sprite.scale.set(pScale, pScale, pScale);

            // Update Position to match particles rotation
            // The main particles group rotates. Special particles are added to SCENE directly?
            // Let's check init logic. Yes, scene.add(sprite).
            // So we need to manually rotate their position to match the group's rotation.

            const worldPos = sp.basePos.clone();
            // Apply the same rotation as 'particles' group
            worldPos.applyEuler(particles.rotation);
            // Apply the current scale
            worldPos.multiplyScalar(state.currentScale);

            sprite.position.copy(worldPos);

            // Update Label Position
            const vector = worldPos.clone();
            vector.project(camera);

            if (vector.z > 1) {
                div.style.opacity = 0;
                div.style.pointerEvents = 'none';
            } else {
                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

                div.style.left = `${x}px`;
                div.style.top = `${y}px`;
                div.style.opacity = visibility;
                div.style.pointerEvents = 'auto';

                // Scale content
                const layoutScale = 0.8 + visibility * 0.4;
                // Add hover scale
                const finalScale = isHovered ? layoutScale * 1.2 : layoutScale;

                const content = div.querySelector('.label-content');
                if (content) content.style.transform = `scale(${finalScale})`;
            }

        } else {
            sprite.visible = false;
            div.style.opacity = 0;
            div.style.pointerEvents = 'none';
        }
    });

    // Reset cursor if no hover (simple global reset, might flick, good enough for now)
    // A better way is to track 'anyHovered' flag.

    renderer.render(scene, camera);
}
