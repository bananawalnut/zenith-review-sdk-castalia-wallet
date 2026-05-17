export type ReviewCaptureEventType = 'recording-started' | 'recording-stopped' | 'capture-mode-changed' | 'pointer-move' | 'pointer-down' | 'pointer-up' | 'click' | 'key-down' | 'selection-change' | 'drawing-enabled' | 'drawing-disabled' | 'drawing-input-enabled' | 'drawing-input-disabled' | 'stroke-started' | 'stroke-point' | 'stroke-ended' | 'audio-chunk' | 'audio-error' | 'time-limit-reached' | 'session-start' | 'navigation' | 'visibility-change';
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
    selectedText?: string;
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
export interface ReviewTimeLimitReachedEvent extends ReviewCaptureEventBase {
    type: 'time-limit-reached';
    timeLimitMs: number;
}
export interface ReviewSessionContext {
    url: string;
    title: string;
    scrollX: number;
    scrollY: number;
    viewportWidth: number;
    viewportHeight: number;
}
export interface ReviewSessionStartEvent extends ReviewCaptureEventBase {
    type: 'session-start';
    url: string;
    title: string;
    scrollX: number;
    scrollY: number;
    viewportWidth: number;
    viewportHeight: number;
}
export type ReviewNavigationTrigger = 'pushstate' | 'replacestate' | 'popstate' | 'hashchange' | 'title-change';
export interface ReviewNavigationCaptureEvent extends ReviewCaptureEventBase {
    type: 'navigation';
    trigger: ReviewNavigationTrigger;
    fromUrl: string;
    fromTitle: string;
    toUrl: string;
    toTitle: string;
    scrollX: number;
    scrollY: number;
}
export interface ReviewVisibilityChangeEvent extends ReviewCaptureEventBase {
    type: 'visibility-change';
    state: 'visible' | 'hidden';
}
export type ReviewCaptureEvent = ReviewRecordingStateEvent | ReviewCaptureModeEvent | ReviewDrawingStateEvent | ReviewDrawingInputStateEvent | ReviewPointerCaptureEvent | ReviewKeyCaptureEvent | ReviewSelectionCaptureEvent | ReviewStrokeCaptureEvent | ReviewAudioCaptureEvent | ReviewAudioErrorEvent | ReviewTimeLimitReachedEvent | ReviewSessionStartEvent | ReviewNavigationCaptureEvent | ReviewVisibilityChangeEvent;
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
    sessionContext: ReviewSessionContext;
    cursor?: ReviewCursorSnapshot;
    selection?: ReviewSelectionSnapshot;
    lastSelection?: ReviewSelectionSnapshot;
    selections: ReviewSelectionSnapshot[];
    strokes: ReviewStroke[];
    events: ReviewCaptureEvent[];
    audio?: ReviewAudioResult;
    timeLimitReached: boolean;
}
export interface ReviewRecorderOptions {
    captureAudio?: boolean;
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
export interface ReviewAuthSessionRequest {
    hubUrl: string;
    projectId: string;
    deploymentId: string;
    email?: string;
    accessCode: string;
    subjectId: string;
}
export interface ReviewAuthSession {
    sessionId: string;
    token: string;
    expiresAt: string;
    projectId: string;
    deploymentId: string;
    label?: string;
}
export interface ReviewAuthSessionStatus {
    authenticated: boolean;
    sessionId?: string;
    expiresAt?: string;
    projectId?: string;
    deploymentId?: string;
    label?: string;
}
export interface ReviewAuthSessionStatusOptions {
    hubUrl: string;
    authToken: string;
}
export type ReviewAuthSessionStorage = 'none' | 'session';
export interface ReviewAuthOverlayOptions extends Omit<ReviewAuthSessionRequest, 'accessCode' | 'email'> {
    email?: string;
    title?: string;
    message?: string;
    emailPlaceholder?: string;
    accessCodePlaceholder?: string;
    submitLabel?: string;
    cancelLabel?: string;
    brandLabel?: string;
    zIndex?: number;
}
export interface AuthenticateReviewSessionOptions extends ReviewAuthOverlayOptions {
    storage?: ReviewAuthSessionStorage;
    storageKey?: string;
    validateStoredSession?: boolean;
}
export declare function getStoredReviewAuthSession(storageKey: string): ReviewAuthSession | null;
export declare function storeReviewAuthSession(storageKey: string, session: ReviewAuthSession | null): void;
export declare function clearStoredReviewAuthSession(storageKey: string): void;
export declare function openReviewAuthOverlay(options: ReviewAuthOverlayOptions): Promise<ReviewAuthSession>;
export declare function authenticateReviewSession(options: AuthenticateReviewSessionOptions): Promise<ReviewAuthSession>;
export type ReviewAuthSessionListener = (session: ReviewAuthSession | null) => void;
export type ReviewAuthLoginTrigger = (options: AuthenticateReviewSessionOptions) => Promise<ReviewAuthSession>;
export interface ReviewAuthSessionManagerOptions extends AuthenticateReviewSessionOptions {
    onSessionChange?: ReviewAuthSessionListener;
    login?: ReviewAuthLoginTrigger;
}
export interface ReviewAuthSessionManager {
    readonly session: ReviewAuthSession | null;
    getSession(): ReviewAuthSession | null;
    restore(): Promise<ReviewAuthSession | null>;
    login(): Promise<ReviewAuthSession>;
    logout(): void;
    validate(): Promise<ReviewAuthSession | null>;
    withSession<T>(action: (session: ReviewAuthSession) => Promise<T> | T): Promise<T>;
    subscribe(listener: ReviewAuthSessionListener): () => void;
}
export declare function createReviewAuthSessionManager(options: ReviewAuthSessionManagerOptions): ReviewAuthSessionManager;
export declare const ZENITH_PRODUCTION_HUB_URL = "https://hub.zenith-research.ca";
export interface ZenithAdminOverlayOptions {
    manager: ReviewAuthSessionManager;
    label?: string;
    zIndex?: number;
    onOpen?: (session: ReviewAuthSession) => void;
    onLoginRequest?: () => void | Promise<void>;
    container?: HTMLElement;
}
export interface ZenithAdminOverlayHandle {
    destroy(): void;
    update(session?: ReviewAuthSession | null): void;
}
export declare function renderZenithAdminOverlay(options: ZenithAdminOverlayOptions): ZenithAdminOverlayHandle;
export interface ReviewHudOptions {
    hubUrl?: string;
    projectId: string;
    deploymentId: string;
    subjectId?: string | (() => string);
    manager?: ReviewAuthSessionManager;
    storage?: ReviewAuthSessionStorage;
    storageKey?: string;
    brandLabel?: string;
    title?: string;
    message?: string;
    accessCodePlaceholder?: string;
    captureAudio?: boolean;
    zIndex?: number;
    onSubmitted?: (result: ReviewSubmitResult) => void;
    onError?: (error: Error) => void;
}
export interface ReviewHudHandle {
    mount(): void;
    unmount(): void;
    reveal(): void;
    startReview(): Promise<void>;
    stopAndSubmit(): Promise<ReviewSubmitResult | null>;
    cancelReview(): Promise<void>;
    logout(): void;
}
export declare function createReviewHud(options: ReviewHudOptions): ReviewHudHandle;
export interface ReviewSubmitOptions {
    hubUrl: string;
    subjectId: string;
    submittedBy?: string;
    projectId: string;
    deploymentId: string;
    authToken: string;
    reviewId?: string;
    signal?: AbortSignal;
}
export interface ReviewSubmitResult {
    reviewId: string;
    assetIds: string[];
    status: string;
}
export declare function createReviewAuthSession(options: ReviewAuthSessionRequest): Promise<ReviewAuthSession>;
export declare function getReviewAuthSession(options: ReviewAuthSessionStatusOptions): Promise<ReviewAuthSessionStatus>;
export declare function submitReview(result: ReviewRecordingResult, options: ReviewSubmitOptions): Promise<ReviewSubmitResult>;
export {};
