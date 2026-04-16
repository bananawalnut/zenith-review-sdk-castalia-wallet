export type ReviewCaptureEventType = 'recording-started' | 'recording-stopped' | 'capture-mode-changed' | 'pointer-move' | 'pointer-down' | 'pointer-up' | 'click' | 'key-down' | 'selection-change' | 'drawing-enabled' | 'drawing-disabled' | 'drawing-input-enabled' | 'drawing-input-disabled' | 'stroke-started' | 'stroke-point' | 'stroke-ended' | 'audio-chunk' | 'audio-error' | 'screenshot-captured' | 'time-limit-reached';
export interface ReviewCaptureEventBase {
    id: number;
    type: ReviewCaptureEventType;
    at: string;
    elapsedMs: number;
}
export interface ReviewRecordingStateEvent extends ReviewCaptureEventBase {
    type: 'recording-started' | 'recording-stopped';
}
export type ReviewCaptureMode = 'drawing' | 'highlight';
export interface ReviewCaptureModeEvent extends ReviewCaptureEventBase {
    type: 'capture-mode-changed';
    mode: ReviewCaptureMode;
}
export interface ReviewDrawingStateEvent extends ReviewCaptureEventBase {
    type: 'drawing-enabled' | 'drawing-disabled';
}
export interface ReviewDrawingInputStateEvent extends ReviewCaptureEventBase {
    type: 'drawing-input-enabled' | 'drawing-input-disabled';
}
export interface ReviewPointerCaptureEvent extends ReviewCaptureEventBase {
    type: 'pointer-move' | 'pointer-down' | 'pointer-up' | 'click';
    x: number;
    y: number;
    pointerType: string;
    buttons: number;
    target?: string;
}
export interface ReviewKeyCaptureEvent extends ReviewCaptureEventBase {
    type: 'key-down';
    key: string;
    code: string;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
}
export interface ReviewCaptureRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ReviewSelectionSnapshot {
    text: string;
    anchor?: string;
    focus?: string;
    capturedAt: string;
    elapsedMs: number;
    rects: ReviewCaptureRect[];
}
export interface ReviewSelectionCaptureEvent extends ReviewCaptureEventBase {
    type: 'selection-change';
    selection?: ReviewSelectionSnapshot;
}
export interface ReviewCursorSnapshot {
    x: number;
    y: number;
    at: string;
    elapsedMs: number;
}
export interface ReviewStrokePoint {
    x: number;
    y: number;
    elapsedMs: number;
}
export interface ReviewStrokeBounds extends ReviewCaptureRect {
}
export interface ReviewStroke {
    id: string;
    startedAt: string;
    endedAt?: string;
    points: ReviewStrokePoint[];
    bounds?: ReviewStrokeBounds;
}
export interface ReviewStrokeCaptureEvent extends ReviewCaptureEventBase {
    type: 'stroke-started' | 'stroke-point' | 'stroke-ended';
    strokeId: string;
    x?: number;
    y?: number;
    pointCount: number;
    bounds?: ReviewStrokeBounds;
}
export interface ReviewAudioCaptureEvent extends ReviewCaptureEventBase {
    type: 'audio-chunk';
    mimeType: string;
    size: number;
}
export interface ReviewAudioErrorEvent extends ReviewCaptureEventBase {
    type: 'audio-error';
    message: string;
}
export interface ReviewScreenshot {
    id: string;
    trigger: 'stroke' | 'selection';
    refId: string;
    capturedAt: string;
    elapsedMs: number;
    blob: Blob;
    width: number;
    height: number;
}
export interface ReviewScreenshotCapturedEvent extends ReviewCaptureEventBase {
    type: 'screenshot-captured';
    screenshotId: string;
    trigger: 'stroke' | 'selection';
    refId: string;
    width: number;
    height: number;
}
export interface ReviewTimeLimitReachedEvent extends ReviewCaptureEventBase {
    type: 'time-limit-reached';
    timeLimitMs: number;
}
export type ReviewCaptureEvent = ReviewRecordingStateEvent | ReviewCaptureModeEvent | ReviewDrawingStateEvent | ReviewDrawingInputStateEvent | ReviewPointerCaptureEvent | ReviewKeyCaptureEvent | ReviewSelectionCaptureEvent | ReviewStrokeCaptureEvent | ReviewAudioCaptureEvent | ReviewAudioErrorEvent | ReviewScreenshotCapturedEvent | ReviewTimeLimitReachedEvent;
export interface ReviewCaptureSnapshot {
    recording: boolean;
    captureMode: ReviewCaptureMode;
    drawingEnabled: boolean;
    drawingInputEnabled: boolean;
    startedAt?: string;
    cursor?: ReviewCursorSnapshot;
    selection?: ReviewSelectionSnapshot;
    lastSelection?: ReviewSelectionSnapshot;
    selections: ReviewSelectionSnapshot[];
    strokes: ReviewStroke[];
    screenshots: ReviewScreenshot[];
    events: ReviewCaptureEvent[];
}
export interface ReviewAudioResult {
    blob: Blob;
    url: string;
    mimeType: string;
    size: number;
    chunks: number;
}
export interface ReviewRecordingResult {
    startedAt: string;
    stoppedAt: string;
    durationMs: number;
    captureMode: ReviewCaptureMode;
    cursor?: ReviewCursorSnapshot;
    selection?: ReviewSelectionSnapshot;
    lastSelection?: ReviewSelectionSnapshot;
    selections: ReviewSelectionSnapshot[];
    strokes: ReviewStroke[];
    screenshots: ReviewScreenshot[];
    events: ReviewCaptureEvent[];
    audio?: ReviewAudioResult;
    timeLimitReached: boolean;
}
export interface ReviewRecorderOptions {
    captureAudio?: boolean;
    captureScreenshots?: boolean;
    timeLimitMs?: number;
    captureMode?: ReviewCaptureMode;
    eventTarget?: Window;
    pointerMoveThrottleMs?: number;
    strokeColor?: string;
    strokeFadeDelayMs?: number;
    strokeFadeDurationMs?: number;
    strokeWidth?: number;
    overlayZIndex?: number;
}
type ReviewCaptureListener = (event: ReviewCaptureEvent, snapshot: ReviewCaptureSnapshot) => void;
export interface ReviewRecorder {
    start(): Promise<void>;
    stop(): Promise<ReviewRecordingResult>;
    setCaptureMode(mode: ReviewCaptureMode): void;
    setDrawingEnabled(enabled: boolean): void;
    setDrawingInputEnabled(enabled: boolean): void;
    getSnapshot(): ReviewCaptureSnapshot;
    subscribe(listener: ReviewCaptureListener): () => void;
}
export declare function createReviewRecorder(options?: ReviewRecorderOptions): ReviewRecorder;
export {};
