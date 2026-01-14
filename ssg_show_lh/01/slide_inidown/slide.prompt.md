# Slide Prompt: Standard Game Download Process

## Content
- **Title**: 游戏下载标准流程 (Standard Game Download Process)
- **Layout**: Split Layout (Left: Interaction, Right: Explanation).
- **Background**: Custom image (`assets/mb.jpg`) with heavy overlay for contrast.
- **Left Side (Interaction)**:
  - **Action Button**: "Download Game" (Initial) -> "Pause" (Downloading) -> "Resume" (Paused) -> "Retry" (Error).
  - **Progress Info**: Progress bar, Downloaded/Total Size (e.g., 1.2GB / 10GB), Speed (e.g., 5MB/s).
  - **Simulation Controls**: Buttons to trigger "Disk Space Full" and "Network Error".
- **Right Side (Explanation)**:
  - Dynamic text explaining the backend/frontend interaction for the current state.
  - **States**:
    - *Idle*: Ready to start.
    - *Downloading*: Requesting chunks, writing to disk.
    - *Paused*: User suspended, saving state.
    - *Error*: Exception handling, retry logic.
  - **Bottom Navigation**: Displays other agenda items for quick switching.

## Visual Style
- **Theme**: Dark, Tech/Game UI.
- **Animations**: Smooth progress bar, state transitions.
