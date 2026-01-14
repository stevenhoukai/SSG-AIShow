# Gemini 3 Pro HTML PPT Project

This project implements a team collaboration architecture for creating HTML-based presentations using Gemini 3 Pro.

## Architecture

- **Code as Document**: Each slide is a self-contained module in a `slide_xx` directory.
- **Decoupled**: Slides do not depend on each other, only on `global.css` and `main.js`.
- **Gemini Powered**: Use the `slide.prompt.md` to instruct Gemini to generate the `slide.js` code.

## Directory Structure

```text
project-root/
├── index.html              # Main Controller
├── css/
│   └── global.css          # Global Styles
├── js/
│   └── main.js             # Global Logic (Nav, State)
├── assets/                 # Public Assets
├── slide_cover/            # [Slide] Cover Page
│   ├── slide.js            # Implementation (Generated)
│   └── slide.prompt.md     # Instruction
├── slide_agenda/           # [Slide] Agenda
└── ...
```

## How to Add a New Slide

1.  **Create Directory**: Create a new folder `slide_name` (e.g., `slide_team`).
2.  **Write Prompt**: Create `slide_name/slide.prompt.md` describing the content and layout.
3.  **Generate Code**: Copy the content of `slide.prompt.md` + the **Core Prompt Template** below, and ask Gemini to generate the `slide.js`.
4.  **Save Code**: Save the generated JS code to `slide_name/slide.js`.
5.  **Register**: Add the new slide to the `slides` array in `js/main.js`.

## Core Prompt Template

When asking Gemini to generate a slide, append this instruction:

```markdown
帮我将{xxxx}的内容生成网页，不要遗漏信息

根据上面内容生成一个 HTML 动态网页代码（只输出 JS 部分，封装在 window.currentSlideRender 函数中）：

- **技术栈**: 
  - 使用 Template Literals 生成 HTML 字符串。
  - 使用 TailwindCSS (CDN) 进行样式设计。
  - 使用 Motion One (window.animate) 或 CSS Animation 做动效。
  - 如果需要图表，使用 ECharts (window.echarts)。
  - 图标使用 Font Awesome (class="fa-solid ...")。

- **视觉风格**:
  - 使用 Bento Grid 风格的视觉设计，可以用浅色底（或根据 slide.prompt.md 指定）。
  - 中英文混用，中文大字体粗体，英文小字作为点缀。
  - 运用高亮色自身透明度渐变制造科技感。
  - 模仿 Apple 官网的动效，向下滚动鼠标配合动效（如果内容较多）。

- **代码要求**:
  - 代码必须包含 `window.currentSlideRender = function(container) { ... }`。
  - 在函数内部清空 container (`container.innerHTML = ''`)。
  - 所有的 HTML 结构通过 `container.innerHTML = ...` 插入。
  - 所有的逻辑（动画、图表初始化）放在插入 HTML 之后。
  - 不要省略内容要点。
```

## Navigation

- **Next Slide**: `Space`, `ArrowRight`, `ArrowDown`
- **Prev Slide**: `ArrowLeft`, `ArrowUp`
- **Overview**: Click the list icon in the bottom left.
