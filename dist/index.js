class DrawingCaptureState {
    context;
    mode = 'drawing';
    constructor(context) {
        this.context = context;
    }
    enter() {
        this.context.clearCurrentSelection();
        this.context.enableDrawingSurface();
        this.context.enableDrawingInput();
    }
    exit() {
        this.context.disableDrawingInput();
        this.context.disableDrawingSurface();
    }
    handleKeyDown(event) {
        if (isCommandModifierKey(event))
            this.context.enableDrawingInput();
    }
    handleKeyUp(event) {
        if (isCommandModifierKey(event))
            this.context.setCaptureMode('highlight');
    }
    handlePointerUp() { }
    handleSelectionChange() { }
}
class HighlightCaptureState {
    context;
    mode = 'highlight';
    constructor(context) {
        this.context = context;
    }
    enter() {
        this.context.disableDrawingInput();
        this.context.disableDrawingSurface();
        this.context.captureSelection();
    }
    exit() {
        this.context.captureSelection();
    }
    handleKeyDown(event) {
        if (isCommandModifierKey(event))
            this.context.setCaptureMode('drawing');
    }
    handleKeyUp() {
        this.context.captureSelection();
        this.context.queueSelectionCapture();
    }
    handlePointerUp() {
        this.context.captureSelection();
        this.context.queueSelectionCapture();
    }
    handleSelectionChange() {
        this.context.captureSelection();
    }
}
function getElementLabel(element) {
    if (!element)
        return undefined;
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = typeof element.className === 'string'
        ? element.className.split(/\s+/).filter(Boolean).slice(0, 2).map(name => `.${name}`).join('')
        : '';
    return `${tag}${id}${className}`;
}
function getEventTargetLabel(target) {
    if (!(target instanceof HTMLElement))
        return undefined;
    return getElementLabel(target);
}
function getSelectionNodeLabel(node) {
    if (!node)
        return undefined;
    if (node instanceof HTMLElement)
        return getElementLabel(node);
    return node.parentElement ? getElementLabel(node.parentElement) : undefined;
}
function rectFromDomRect(rect) {
    return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
    };
}
function getStrokeBounds(points) {
    if (points.length === 0)
        return undefined;
    const xs = points.map(point => point.x);
    const ys = points.map(point => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
function getDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
function isCommandModifierKey(event) {
    return event.key === 'Meta' || event.code === 'MetaLeft' || event.code === 'MetaRight';
}
function getRecorderMimeType() {
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
    ];
    return candidates.find(candidate => (typeof MediaRecorder !== 'undefined'
        && MediaRecorder.isTypeSupported(candidate))) ?? '';
}
class BrowserReviewRecorder {
    options;
    recording = false;
    captureMode;
    captureState;
    drawingEnabled = false;
    drawingInputEnabled = false;
    startedAt = '';
    startTime = 0;
    eventId = 0;
    strokeId = 0;
    lastPointerMoveAt = 0;
    events = [];
    strokes = [];
    cursor;
    selection;
    lastSelection;
    selections = [];
    lastSelectionKey = '';
    listeners = new Set();
    disposers = [];
    overlayDisposers = [];
    overlayCanvas;
    overlayContext;
    overlayAnimationFrame;
    strokeCandidate;
    activeStroke;
    strokeFadeWindows = new Map();
    stream;
    mediaRecorder;
    audioChunks = [];
    audioMimeType = '';
    imageCapture;
    screenshots = [];
    screenshotId = 0;
    timeLimitReached = false;
    timeLimitTimer;
    pendingPointerEvent;
    pendingPointerNotification;
    stateContext = {
        captureSelection: () => this.captureSelection(),
        clearCurrentSelection: () => this.clearCurrentSelection(),
        disableDrawingInput: () => this.disableDrawingInput(),
        disableDrawingSurface: () => this.disableDrawingSurface(),
        enableDrawingInput: () => this.enableDrawingInput(),
        enableDrawingSurface: () => this.enableDrawingSurface(),
        queueSelectionCapture: () => this.queueSelectionCapture(),
        setCaptureMode: mode => this.setCaptureMode(mode),
    };
    constructor(options = {}) {
        this.options = {
            captureAudio: options.captureAudio ?? true,
            captureScreenshots: options.captureScreenshots ?? true,
            timeLimitMs: options.timeLimitMs ?? 420_000,
            captureMode: options.captureMode ?? 'highlight',
            pointerMoveThrottleMs: options.pointerMoveThrottleMs ?? 64,
            strokeColor: options.strokeColor ?? '#02b286',
            strokeFadeDelayMs: options.strokeFadeDelayMs ?? 4000,
            strokeFadeDurationMs: options.strokeFadeDurationMs ?? 1600,
            strokeWidth: options.strokeWidth ?? 3,
            overlayZIndex: options.overlayZIndex ?? 2147483000,
            eventTarget: options.eventTarget,
        };
        this.captureMode = this.options.captureMode;
        this.captureState = this.createCaptureState(this.captureMode);
    }
    async start() {
        if (this.recording)
            return;
        this.recording = true;
        this.startedAt = new Date().toISOString();
        this.startTime = performance.now();
        this.eventId = 0;
        this.lastPointerMoveAt = 0;
        this.captureMode = this.options.captureMode;
        this.captureState = this.createCaptureState(this.captureMode);
        this.drawingEnabled = false;
        this.drawingInputEnabled = false;
        this.cancelOverlayAnimation();
        this.events = [];
        this.strokes = [];
        this.strokeFadeWindows.clear();
        this.cursor = undefined;
        this.selection = undefined;
        this.lastSelection = undefined;
        this.selections = [];
        this.lastSelectionKey = '';
        this.audioChunks = [];
        this.screenshots = [];
        this.screenshotId = 0;
        this.timeLimitReached = false;
        this.bindPassiveRecordingEvents();
        if (this.options.timeLimitMs > 0) {
            this.timeLimitTimer = this.targetWindow.setTimeout(() => {
                this.timeLimitReached = true;
                this.log({ type: 'time-limit-reached', timeLimitMs: this.options.timeLimitMs });
                void this.stop();
            }, this.options.timeLimitMs);
            this.disposers.push(() => {
                if (this.timeLimitTimer !== undefined) {
                    this.targetWindow.clearTimeout(this.timeLimitTimer);
                    this.timeLimitTimer = undefined;
                }
            });
        }
        this.captureState.enter();
        this.log({ type: 'recording-started' });
        await this.startMediaCapture();
    }
    async stop() {
        if (!this.recording) {
            return this.buildResult();
        }
        this.captureState.exit();
        this.unmountOverlay();
        this.drawingInputEnabled = false;
        this.drawingEnabled = false;
        this.recording = false;
        this.log({ type: 'recording-stopped' });
        this.clearPendingPointerNotification();
        this.disposers.forEach(dispose => dispose());
        this.disposers = [];
        this.imageCapture = undefined;
        await this.stopMediaCapture();
        return this.buildResult();
    }
    setCaptureMode(mode) {
        if (this.captureMode === mode)
            return;
        this.captureState.exit();
        this.captureMode = mode;
        this.captureState = this.createCaptureState(mode);
        if (this.recording)
            this.captureState.enter();
        this.log({ type: 'capture-mode-changed', mode });
    }
    setDrawingEnabled(enabled) {
        if (enabled) {
            this.enableDrawingSurface();
            return;
        }
        this.disableDrawingSurface();
    }
    setDrawingInputEnabled(enabled) {
        if (enabled) {
            this.enableDrawingInput();
            return;
        }
        this.disableDrawingInput();
    }
    getSnapshot() {
        return {
            recording: this.recording,
            captureMode: this.captureMode,
            drawingEnabled: this.drawingEnabled,
            drawingInputEnabled: this.drawingInputEnabled,
            startedAt: this.startedAt || undefined,
            cursor: this.cursor,
            selection: this.selection,
            lastSelection: this.lastSelection,
            selections: this.selections.map(selection => ({
                ...selection,
                rects: [...selection.rects],
            })),
            strokes: this.strokes.map(stroke => ({ ...stroke, points: [...stroke.points] })),
            screenshots: [...this.screenshots],
            events: [...this.events],
        };
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    createCaptureState(mode) {
        return mode === 'drawing'
            ? new DrawingCaptureState(this.stateContext)
            : new HighlightCaptureState(this.stateContext);
    }
    get targetWindow() {
        return this.options.eventTarget ?? window;
    }
    get document() {
        return this.targetWindow.document;
    }
    getElapsedMs() {
        return Math.round(performance.now() - this.startTime);
    }
    log(event) {
        const entry = {
            id: ++this.eventId,
            at: new Date().toISOString(),
            elapsedMs: this.getElapsedMs(),
            ...event,
        };
        this.events.push(entry);
        this.notifyListeners(entry);
    }
    notifyListeners(entry) {
        if (this.isPointerCaptureEvent(entry)) {
            this.pendingPointerEvent = entry;
            if (this.pendingPointerNotification !== undefined) {
                this.targetWindow.clearTimeout(this.pendingPointerNotification);
            }
            this.pendingPointerNotification = this.targetWindow.setTimeout(() => {
                const pendingEvent = this.pendingPointerEvent;
                this.pendingPointerEvent = undefined;
                this.pendingPointerNotification = undefined;
                if (!pendingEvent)
                    return;
                this.publishSnapshot(pendingEvent);
            }, 180);
            return;
        }
        this.publishSnapshot(entry);
    }
    publishSnapshot(entry) {
        const snapshot = this.getSnapshot();
        this.listeners.forEach(listener => listener(entry, snapshot));
    }
    clearPendingPointerNotification() {
        if (this.pendingPointerNotification !== undefined) {
            this.targetWindow.clearTimeout(this.pendingPointerNotification);
        }
        this.pendingPointerEvent = undefined;
        this.pendingPointerNotification = undefined;
    }
    isPointerCaptureEvent(event) {
        return (event.type === 'pointer-move'
            || event.type === 'pointer-down'
            || event.type === 'pointer-up'
            || event.type === 'click');
    }
    bindPassiveRecordingEvents() {
        const target = this.targetWindow;
        const doc = this.document;
        const passiveOptions = { passive: true };
        const addWindowListener = (type, handler, options = passiveOptions) => {
            target.addEventListener(type, handler, options);
            this.disposers.push(() => target.removeEventListener(type, handler, options));
        };
        const addDocumentListener = (type, handler) => {
            doc.addEventListener(type, handler);
            this.disposers.push(() => doc.removeEventListener(type, handler));
        };
        addWindowListener('pointermove', event => {
            this.cursor = this.getCursorSnapshot(event);
            const elapsed = performance.now() - this.startTime;
            if (elapsed - this.lastPointerMoveAt < this.options.pointerMoveThrottleMs)
                return;
            this.lastPointerMoveAt = elapsed;
            this.logPointerEvent('pointer-move', event);
        });
        addWindowListener('pointerdown', event => {
            this.cursor = this.getCursorSnapshot(event);
            this.logPointerEvent('pointer-down', event);
        });
        addWindowListener('pointerup', event => {
            this.cursor = this.getCursorSnapshot(event);
            this.logPointerEvent('pointer-up', event);
            this.captureState.handlePointerUp(event);
        });
        addWindowListener('click', event => this.logPointerEvent('click', event));
        addWindowListener('keyup', event => this.captureState.handleKeyUp(event));
        addWindowListener('blur', () => {
            if (this.captureMode === 'drawing')
                this.setCaptureMode('highlight');
        });
        addWindowListener('keydown', event => {
            this.log({
                type: 'key-down',
                key: event.key,
                code: event.code,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
            });
            this.captureState.handleKeyDown(event);
        }, {});
        addDocumentListener('selectionchange', () => this.captureState.handleSelectionChange());
    }
    getCursorSnapshot(event) {
        return {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
            at: new Date().toISOString(),
            elapsedMs: this.getElapsedMs(),
        };
    }
    getPoint(event) {
        return {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
            elapsedMs: this.getElapsedMs(),
        };
    }
    logPointerEvent(type, event) {
        this.cursor = this.getCursorSnapshot(event);
        this.log({
            type,
            x: this.cursor.x,
            y: this.cursor.y,
            pointerType: 'pointerType' in event ? event.pointerType : 'mouse',
            buttons: event.buttons,
            target: getEventTargetLabel(event.target),
        });
    }
    captureSelection() {
        if (this.captureMode !== 'highlight')
            return;
        const selection = this.document.getSelection();
        const text = selection?.toString() ?? '';
        if (!selection || text.length === 0 || selection.rangeCount === 0) {
            if (!this.selection && this.lastSelectionKey === '')
                return;
            this.selection = undefined;
            this.lastSelectionKey = '';
            this.log({ type: 'selection-change', selection: undefined });
            return;
        }
        const range = selection.getRangeAt(0);
        const rects = Array.from(range.getClientRects())
            .filter(rect => rect.width > 0 || rect.height > 0)
            .map(rectFromDomRect);
        const nextSelection = {
            text,
            anchor: getSelectionNodeLabel(selection.anchorNode),
            focus: getSelectionNodeLabel(selection.focusNode),
            capturedAt: new Date().toISOString(),
            elapsedMs: this.getElapsedMs(),
            rects,
        };
        const selectionKey = JSON.stringify({
            text: nextSelection.text,
            anchor: nextSelection.anchor,
            focus: nextSelection.focus,
            rects: nextSelection.rects,
        });
        if (selectionKey === this.lastSelectionKey)
            return;
        this.selection = nextSelection;
        this.lastSelection = nextSelection;
        this.selections.push(nextSelection);
        this.lastSelectionKey = selectionKey;
        this.log({ type: 'selection-change', selection: nextSelection });
        void this.takeScreenshot('selection', selectionKey.slice(0, 64));
    }
    clearCurrentSelection() {
        this.selection = undefined;
        this.lastSelectionKey = '';
    }
    queueSelectionCapture() {
        this.targetWindow.setTimeout(() => {
            if (this.recording)
                this.captureSelection();
        }, 48);
    }
    mountOverlay() {
        if (this.overlayCanvas)
            return;
        const canvas = this.document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context)
            return;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.dataset.zenithReviewDrawingOverlay = 'true';
        Object.assign(canvas.style, {
            position: 'fixed',
            inset: '0',
            width: '100vw',
            height: '100vh',
            zIndex: String(this.options.overlayZIndex),
            background: 'transparent',
            pointerEvents: this.drawingInputEnabled ? 'auto' : 'none',
            touchAction: 'none',
            cursor: this.drawingInputEnabled ? 'crosshair' : 'default',
        });
        this.overlayCanvas = canvas;
        this.overlayContext = context;
        this.document.body.append(canvas);
        this.resizeOverlay();
        this.syncOverlayInputState();
        this.bindOverlayEvents(canvas);
    }
    bindOverlayEvents(canvas) {
        const addOverlayListener = (type, handler) => {
            canvas.addEventListener(type, handler);
            this.overlayDisposers.push(() => canvas.removeEventListener(type, handler));
        };
        addOverlayListener('pointerdown', event => this.handleOverlayPointerDown(event));
        addOverlayListener('pointermove', event => this.handleOverlayPointerMove(event));
        addOverlayListener('pointerup', event => this.handleOverlayPointerUp(event));
        addOverlayListener('pointercancel', event => this.handleOverlayPointerUp(event));
        this.targetWindow.addEventListener('resize', this.resizeOverlay, { passive: true });
        this.overlayDisposers.push(() => this.targetWindow.removeEventListener('resize', this.resizeOverlay));
    }
    resizeOverlay = () => {
        const canvas = this.overlayCanvas;
        const context = this.overlayContext;
        if (!canvas || !context)
            return;
        const dpr = this.targetWindow.devicePixelRatio || 1;
        const width = this.targetWindow.innerWidth;
        const height = this.targetWindow.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.redrawOverlay();
    };
    unmountOverlay() {
        this.overlayDisposers.forEach(dispose => dispose());
        this.overlayDisposers = [];
        this.cancelOverlayAnimation();
        this.overlayCanvas?.remove();
        this.overlayCanvas = undefined;
        this.overlayContext = undefined;
        this.strokeCandidate = undefined;
        this.activeStroke = undefined;
    }
    handleOverlayPointerDown(event) {
        if (!this.drawingInputEnabled)
            return;
        event.preventDefault();
        this.overlayCanvas?.setPointerCapture(event.pointerId);
        this.cursor = this.getCursorSnapshot(event);
        this.strokeCandidate = {
            id: `stroke-${++this.strokeId}`,
            startedAt: new Date().toISOString(),
            points: [this.getPoint(event)],
        };
        this.activeStroke = {
            id: this.strokeCandidate.id,
            startedAt: this.strokeCandidate.startedAt,
            points: [...this.strokeCandidate.points],
        };
        this.strokeFadeWindows.delete(this.activeStroke.id);
        this.strokes.push(this.activeStroke);
        this.redrawOverlay();
        this.log({
            type: 'stroke-started',
            strokeId: this.activeStroke.id,
            x: this.activeStroke.points[0].x,
            y: this.activeStroke.points[0].y,
            pointCount: this.activeStroke.points.length,
        });
    }
    handleOverlayPointerMove(event) {
        if (!this.drawingInputEnabled)
            return;
        if (!this.activeStroke || !this.strokeCandidate)
            return;
        event.preventDefault();
        this.cursor = this.getCursorSnapshot(event);
        const nextPoint = this.getPoint(event);
        const lastPoint = this.activeStroke.points[this.activeStroke.points.length - 1];
        if (lastPoint && getDistance(lastPoint, nextPoint) < 2)
            return;
        this.strokeCandidate.points.push(nextPoint);
        this.activeStroke.points.push(nextPoint);
        this.activeStroke.bounds = getStrokeBounds(this.activeStroke.points);
        this.redrawOverlay();
        this.log({
            type: 'stroke-point',
            strokeId: this.activeStroke.id,
            x: nextPoint.x,
            y: nextPoint.y,
            pointCount: this.activeStroke.points.length,
            bounds: this.activeStroke.bounds,
        });
    }
    handleOverlayPointerUp(event) {
        if (!this.drawingInputEnabled)
            return;
        if (!this.activeStroke)
            return;
        event.preventDefault();
        this.cursor = this.getCursorSnapshot(event);
        this.finishStrokeCandidate(event);
    }
    enableDrawingSurface() {
        if (this.captureMode !== 'drawing' || this.drawingEnabled)
            return;
        this.drawingEnabled = true;
        if (!this.recording)
            return;
        this.mountOverlay();
        this.syncOverlayInputState();
        this.log({ type: 'drawing-enabled' });
    }
    disableDrawingSurface() {
        if (!this.drawingEnabled)
            return;
        this.disableDrawingInput();
        this.finishStrokeCandidate();
        this.drawingEnabled = false;
        this.syncOverlayInputState();
        if (this.recording)
            this.log({ type: 'drawing-disabled' });
        if (this.hasActiveStrokeFades()) {
            this.scheduleOverlayAnimation();
            return;
        }
        this.unmountOverlay();
    }
    enableDrawingInput() {
        if (!this.recording
            || this.captureMode !== 'drawing'
            || !this.drawingEnabled
            || this.drawingInputEnabled)
            return;
        this.drawingInputEnabled = true;
        this.syncOverlayInputState();
        this.log({ type: 'drawing-input-enabled' });
    }
    disableDrawingInput() {
        if (!this.drawingInputEnabled)
            return;
        this.drawingInputEnabled = false;
        this.syncOverlayInputState();
        this.finishStrokeCandidate();
        this.log({ type: 'drawing-input-disabled' });
    }
    syncOverlayInputState() {
        const canvas = this.overlayCanvas;
        if (!canvas)
            return;
        canvas.style.pointerEvents = this.drawingInputEnabled ? 'auto' : 'none';
        canvas.style.cursor = this.drawingInputEnabled ? 'crosshair' : 'default';
    }
    finishStrokeCandidate(event) {
        if (this.activeStroke && event) {
            const nextPoint = this.getPoint(event);
            const lastPoint = this.activeStroke.points[this.activeStroke.points.length - 1];
            if (!lastPoint || getDistance(lastPoint, nextPoint) >= 2) {
                this.activeStroke.points.push(nextPoint);
            }
        }
        if (this.activeStroke) {
            this.activeStroke.endedAt = new Date().toISOString();
            this.activeStroke.bounds = getStrokeBounds(this.activeStroke.points);
            this.beginStrokeFade(this.activeStroke.id);
            this.redrawOverlay();
            this.log({
                type: 'stroke-ended',
                strokeId: this.activeStroke.id,
                x: this.activeStroke.points.at(-1)?.x,
                y: this.activeStroke.points.at(-1)?.y,
                pointCount: this.activeStroke.points.length,
                bounds: this.activeStroke.bounds,
            });
            void this.takeScreenshot('stroke', this.activeStroke.id);
        }
        this.strokeCandidate = undefined;
        this.activeStroke = undefined;
    }
    beginStrokeFade(strokeId) {
        const fadeStart = performance.now() + this.options.strokeFadeDelayMs;
        const fadeEnd = fadeStart + this.options.strokeFadeDurationMs;
        this.strokeFadeWindows.set(strokeId, { fadeStart, fadeEnd });
        this.scheduleOverlayAnimation();
    }
    scheduleOverlayAnimation() {
        if (this.overlayAnimationFrame !== undefined || !this.overlayCanvas)
            return;
        this.overlayAnimationFrame = this.targetWindow.requestAnimationFrame(this.handleOverlayAnimationFrame);
    }
    handleOverlayAnimationFrame = () => {
        this.overlayAnimationFrame = undefined;
        this.redrawOverlay();
        if (this.hasActiveStrokeFades()) {
            this.scheduleOverlayAnimation();
            return;
        }
        if (!this.drawingEnabled)
            this.unmountOverlay();
    };
    cancelOverlayAnimation() {
        if (this.overlayAnimationFrame === undefined)
            return;
        this.targetWindow.cancelAnimationFrame(this.overlayAnimationFrame);
        this.overlayAnimationFrame = undefined;
    }
    hasActiveStrokeFades() {
        const now = performance.now();
        return Array.from(this.strokeFadeWindows.values())
            .some(fadeWindow => now < fadeWindow.fadeEnd);
    }
    getStrokeOpacity(stroke) {
        if (this.activeStroke?.id === stroke.id)
            return 1;
        const fadeWindow = this.strokeFadeWindows.get(stroke.id);
        if (!fadeWindow)
            return 1;
        const now = performance.now();
        if (now < fadeWindow.fadeStart)
            return 1;
        if (now >= fadeWindow.fadeEnd)
            return 0;
        const fadeDuration = Math.max(1, fadeWindow.fadeEnd - fadeWindow.fadeStart);
        return 1 - ((now - fadeWindow.fadeStart) / fadeDuration);
    }
    drawStroke(stroke, opacity = 1) {
        const context = this.overlayContext;
        if (!context || stroke.points.length === 0 || opacity <= 0)
            return;
        context.save();
        context.globalAlpha = opacity;
        context.strokeStyle = this.options.strokeColor;
        context.fillStyle = this.options.strokeColor;
        context.lineWidth = this.options.strokeWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        const [firstPoint, ...remainingPoints] = stroke.points;
        if (remainingPoints.length === 0) {
            context.arc(firstPoint.x, firstPoint.y, this.options.strokeWidth / 2, 0, Math.PI * 2);
            context.fill();
            context.restore();
            return;
        }
        context.moveTo(firstPoint.x, firstPoint.y);
        remainingPoints.forEach(point => context.lineTo(point.x, point.y));
        context.stroke();
        context.restore();
    }
    redrawOverlay() {
        const context = this.overlayContext;
        const canvas = this.overlayCanvas;
        if (!context || !canvas)
            return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.strokes.forEach(stroke => {
            this.drawStroke(stroke, this.getStrokeOpacity(stroke));
        });
    }
    async startMediaCapture() {
        // When captureScreenshots is enabled, use getDisplayMedia to get screen video + audio
        // in a single permission request. Fall back to getUserMedia (audio only) on denial.
        if (this.options.captureScreenshots) {
            try {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: 1 },
                    audio: this.options.captureAudio,
                });
                this.stream = displayStream;
                const videoTracks = displayStream.getVideoTracks();
                if (videoTracks[0] && typeof ImageCapture !== 'undefined') {
                    this.imageCapture = new ImageCapture(videoTracks[0]);
                }
                // If getDisplayMedia returned audio, use it. Otherwise fall through to getUserMedia.
                const hasAudio = displayStream.getAudioTracks().length > 0;
                if (this.options.captureAudio && !hasAudio) {
                    try {
                        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        micStream.getAudioTracks().forEach(track => this.stream.addTrack(track));
                    }
                    catch {
                        // Mic fallback denied — audio capture skipped
                    }
                }
            }
            catch {
                // getDisplayMedia denied — fall back to audio-only if requested
                if (this.options.captureAudio) {
                    try {
                        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    }
                    catch (error) {
                        this.log({
                            type: 'audio-error',
                            message: error instanceof Error ? error.message : 'Microphone capture failed.',
                        });
                    }
                }
            }
        }
        else if (this.options.captureAudio) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            catch (error) {
                this.log({
                    type: 'audio-error',
                    message: error instanceof Error ? error.message : 'Microphone capture failed.',
                });
            }
        }
        if (this.options.captureAudio && this.stream) {
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length > 0) {
                // Build an audio-only stream for MediaRecorder
                const audioStream = new MediaStream(audioTracks);
                this.audioMimeType = getRecorderMimeType();
                this.mediaRecorder = new MediaRecorder(audioStream, this.audioMimeType ? { mimeType: this.audioMimeType } : undefined);
                this.mediaRecorder.addEventListener('dataavailable', event => {
                    if (event.data.size === 0)
                        return;
                    this.audioChunks.push(event.data);
                    this.log({
                        type: 'audio-chunk',
                        mimeType: event.data.type || this.audioMimeType || 'audio/webm',
                        size: event.data.size,
                    });
                });
                this.mediaRecorder.start(1000);
            }
        }
    }
    async stopMediaCapture() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            await new Promise(resolve => {
                this.mediaRecorder?.addEventListener('stop', () => resolve(), { once: true });
                this.mediaRecorder?.stop();
            });
        }
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = undefined;
        this.mediaRecorder = undefined;
    }
    async takeScreenshot(trigger, refId) {
        const imageCapture = this.imageCapture;
        if (!imageCapture)
            return;
        try {
            const bitmap = await imageCapture.grabFrame();
            const canvas = this.document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
            bitmap.close();
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
            if (!blob)
                return;
            const screenshot = {
                id: `screenshot-${++this.screenshotId}`,
                trigger,
                refId,
                capturedAt: new Date().toISOString(),
                elapsedMs: this.getElapsedMs(),
                blob,
                width: bitmap.width,
                height: bitmap.height,
            };
            this.screenshots.push(screenshot);
            this.log({
                type: 'screenshot-captured',
                screenshotId: screenshot.id,
                trigger,
                refId,
                width: screenshot.width,
                height: screenshot.height,
            });
        }
        catch {
            // Screenshot capture failures are non-fatal — the review continues
        }
    }
    buildResult() {
        const stoppedAt = new Date().toISOString();
        const audioBlob = this.audioChunks.length > 0
            ? new Blob(this.audioChunks, { type: this.audioMimeType || this.audioChunks[0]?.type || 'audio/webm' })
            : undefined;
        return {
            startedAt: this.startedAt || stoppedAt,
            stoppedAt,
            durationMs: this.startTime ? this.getElapsedMs() : 0,
            captureMode: this.captureMode,
            cursor: this.cursor,
            selection: this.selection,
            lastSelection: this.lastSelection,
            selections: this.selections.map(selection => ({
                ...selection,
                rects: [...selection.rects],
            })),
            strokes: this.strokes.map(stroke => ({ ...stroke, points: [...stroke.points] })),
            screenshots: [...this.screenshots],
            events: [...this.events],
            timeLimitReached: this.timeLimitReached,
            audio: audioBlob ? {
                blob: audioBlob,
                url: URL.createObjectURL(audioBlob),
                mimeType: audioBlob.type,
                size: audioBlob.size,
                chunks: this.audioChunks.length,
            } : undefined,
        };
    }
}
export function createReviewRecorder(options) {
    return new BrowserReviewRecorder(options);
}
