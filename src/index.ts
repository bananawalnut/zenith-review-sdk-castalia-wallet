export type ReviewCaptureEventType =
  | 'recording-started'
  | 'recording-stopped'
  | 'capture-mode-changed'
  | 'pointer-move'
  | 'pointer-down'
  | 'pointer-up'
  | 'click'
  | 'key-down'
  | 'selection-change'
  | 'drawing-enabled'
  | 'drawing-disabled'
  | 'drawing-input-enabled'
  | 'drawing-input-disabled'
  | 'stroke-started'
  | 'stroke-point'
  | 'stroke-ended'
  | 'audio-chunk'
  | 'audio-error'
  | 'screenshot-captured'
  | 'time-limit-reached'
  | 'session-start'
  | 'navigation'
  | 'visibility-change'

export interface ReviewCaptureEventBase {
  id: number
  type: ReviewCaptureEventType
  at: string
  elapsedMs: number
}

export interface ReviewRecordingStateEvent extends ReviewCaptureEventBase {
  type: 'recording-started' | 'recording-stopped'
}

export type ReviewCaptureMode = 'drawing' | 'highlight'

export interface ReviewCaptureModeEvent extends ReviewCaptureEventBase {
  type: 'capture-mode-changed'
  mode: ReviewCaptureMode
}

export interface ReviewDrawingStateEvent extends ReviewCaptureEventBase {
  type: 'drawing-enabled' | 'drawing-disabled'
}

export interface ReviewDrawingInputStateEvent extends ReviewCaptureEventBase {
  type: 'drawing-input-enabled' | 'drawing-input-disabled'
}

export interface ReviewPointerCaptureEvent extends ReviewCaptureEventBase {
  type: 'pointer-move' | 'pointer-down' | 'pointer-up' | 'click'
  x: number
  y: number
  pointerType: string
  buttons: number
  target?: string
}

export interface ReviewKeyCaptureEvent extends ReviewCaptureEventBase {
  type: 'key-down'
  key: string
  code: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export interface ReviewCaptureRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ReviewSelectionSnapshot {
  text: string
  anchor?: string
  focus?: string
  capturedAt: string
  elapsedMs: number
  rects: ReviewCaptureRect[]
}

export interface ReviewSelectionCaptureEvent extends ReviewCaptureEventBase {
  type: 'selection-change'
  selection?: ReviewSelectionSnapshot
}

export interface ReviewCursorSnapshot {
  x: number
  y: number
  at: string
  elapsedMs: number
}

export interface ReviewStrokePoint {
  x: number
  y: number
  elapsedMs: number
}

export interface ReviewStrokeBounds extends ReviewCaptureRect {}

export interface ReviewStroke {
  id: string
  startedAt: string
  endedAt?: string
  points: ReviewStrokePoint[]
  bounds?: ReviewStrokeBounds
}

export interface ReviewStrokeCaptureEvent extends ReviewCaptureEventBase {
  type: 'stroke-started' | 'stroke-point' | 'stroke-ended'
  strokeId: string
  x?: number
  y?: number
  pointCount: number
  bounds?: ReviewStrokeBounds
}

export interface ReviewAudioCaptureEvent extends ReviewCaptureEventBase {
  type: 'audio-chunk'
  mimeType: string
  size: number
}

export interface ReviewAudioErrorEvent extends ReviewCaptureEventBase {
  type: 'audio-error'
  message: string
}

export interface ReviewScreenshot {
  id: string
  trigger: 'stroke' | 'selection'
  refId: string          // stroke ID or a selection key
  capturedAt: string
  elapsedMs: number
  blob: Blob
  width: number
  height: number
}

export interface ReviewScreenshotCapturedEvent extends ReviewCaptureEventBase {
  type: 'screenshot-captured'
  screenshotId: string
  trigger: 'stroke' | 'selection'
  refId: string
  width: number
  height: number
}

export interface ReviewTimeLimitReachedEvent extends ReviewCaptureEventBase {
  type: 'time-limit-reached'
  timeLimitMs: number
}

export interface ReviewSessionContext {
  url: string
  title: string
  scrollX: number
  scrollY: number
  viewportWidth: number
  viewportHeight: number
}

export interface ReviewSessionStartEvent extends ReviewCaptureEventBase {
  type: 'session-start'
  url: string
  title: string
  scrollX: number
  scrollY: number
  viewportWidth: number
  viewportHeight: number
}

export type ReviewNavigationTrigger =
  | 'pushstate'
  | 'replacestate'
  | 'popstate'
  | 'hashchange'
  | 'title-change'

export interface ReviewNavigationCaptureEvent extends ReviewCaptureEventBase {
  type: 'navigation'
  trigger: ReviewNavigationTrigger
  fromUrl: string
  fromTitle: string
  toUrl: string
  toTitle: string
  scrollX: number
  scrollY: number
}

export interface ReviewVisibilityChangeEvent extends ReviewCaptureEventBase {
  type: 'visibility-change'
  state: 'visible' | 'hidden'
}

export type ReviewCaptureEvent =
  | ReviewRecordingStateEvent
  | ReviewCaptureModeEvent
  | ReviewDrawingStateEvent
  | ReviewDrawingInputStateEvent
  | ReviewPointerCaptureEvent
  | ReviewKeyCaptureEvent
  | ReviewSelectionCaptureEvent
  | ReviewStrokeCaptureEvent
  | ReviewAudioCaptureEvent
  | ReviewAudioErrorEvent
  | ReviewScreenshotCapturedEvent
  | ReviewTimeLimitReachedEvent
  | ReviewSessionStartEvent
  | ReviewNavigationCaptureEvent
  | ReviewVisibilityChangeEvent

export interface ReviewCaptureSnapshot {
  recording: boolean
  captureMode: ReviewCaptureMode
  drawingEnabled: boolean
  drawingInputEnabled: boolean
  startedAt?: string
  cursor?: ReviewCursorSnapshot
  selection?: ReviewSelectionSnapshot
  lastSelection?: ReviewSelectionSnapshot
  selections: ReviewSelectionSnapshot[]
  strokes: ReviewStroke[]
  screenshots: ReviewScreenshot[]
  events: ReviewCaptureEvent[]
}

export interface ReviewAudioResult {
  blob: Blob
  url: string
  mimeType: string
  size: number
  chunks: number
}

export interface ReviewRecordingResult {
  startedAt: string
  stoppedAt: string
  durationMs: number
  captureMode: ReviewCaptureMode
  sessionContext: ReviewSessionContext
  cursor?: ReviewCursorSnapshot
  selection?: ReviewSelectionSnapshot
  lastSelection?: ReviewSelectionSnapshot
  selections: ReviewSelectionSnapshot[]
  strokes: ReviewStroke[]
  screenshots: ReviewScreenshot[]
  events: ReviewCaptureEvent[]
  audio?: ReviewAudioResult
  timeLimitReached: boolean
}

export interface ReviewRecorderOptions {
  captureAudio?: boolean
  captureScreenshots?: boolean  // default true — uses getDisplayMedia; degrades gracefully if denied
  timeLimitMs?: number          // default 420_000 (7 min); 0 = no limit
  captureMode?: ReviewCaptureMode
  eventTarget?: Window
  pointerMoveThrottleMs?: number
  strokeColor?: string
  strokeFadeDelayMs?: number
  strokeFadeDurationMs?: number
  strokeWidth?: number
  overlayZIndex?: number
}

type ReviewCaptureListener = (event: ReviewCaptureEvent, snapshot: ReviewCaptureSnapshot) => void
type ReviewCaptureEventInput = ReviewCaptureEvent extends infer Event
  ? Event extends ReviewCaptureEvent
    ? Omit<Event, 'id' | 'at' | 'elapsedMs'>
    : never
  : never

export interface ReviewRecorder {
  start(): Promise<void>
  stop(): Promise<ReviewRecordingResult>
  setCaptureMode(mode: ReviewCaptureMode): void
  setDrawingEnabled(enabled: boolean): void
  setDrawingInputEnabled(enabled: boolean): void
  getSnapshot(): ReviewCaptureSnapshot
  subscribe(listener: ReviewCaptureListener): () => void
}

interface StrokeCandidate {
  id: string
  startedAt: string
  points: ReviewStrokePoint[]
}

interface StrokeFadeWindow {
  fadeStart: number
  fadeEnd: number
}

interface ReviewCaptureStateContext {
  captureSelection(): void
  clearCurrentSelection(): void
  disableDrawingInput(): void
  disableDrawingSurface(): void
  enableDrawingInput(): void
  enableDrawingSurface(): void
  queueSelectionCapture(): void
  setCaptureMode(mode: ReviewCaptureMode): void
}

interface ReviewCaptureStateController {
  readonly mode: ReviewCaptureMode
  enter(): void
  exit(): void
  handleKeyDown(event: KeyboardEvent): void
  handleKeyUp(event: KeyboardEvent): void
  handlePointerUp(event: PointerEvent): void
  handleSelectionChange(): void
}

class DrawingCaptureState implements ReviewCaptureStateController {
  readonly mode = 'drawing' satisfies ReviewCaptureMode

  constructor(private readonly context: ReviewCaptureStateContext) {}

  enter() {
    this.context.clearCurrentSelection()
    this.context.enableDrawingSurface()
    this.context.enableDrawingInput()
  }

  exit() {
    this.context.disableDrawingInput()
    this.context.disableDrawingSurface()
  }

  handleKeyDown(event: KeyboardEvent) {
    if (isCommandModifierKey(event)) this.context.enableDrawingInput()
  }

  handleKeyUp(event: KeyboardEvent) {
    if (isCommandModifierKey(event)) this.context.setCaptureMode('highlight')
  }

  handlePointerUp() {}

  handleSelectionChange() {}
}

class HighlightCaptureState implements ReviewCaptureStateController {
  readonly mode = 'highlight' satisfies ReviewCaptureMode

  constructor(private readonly context: ReviewCaptureStateContext) {}

  enter() {
    this.context.disableDrawingInput()
    this.context.disableDrawingSurface()
    this.context.captureSelection()
  }

  exit() {
    this.context.captureSelection()
  }

  handleKeyDown(event: KeyboardEvent) {
    if (isCommandModifierKey(event)) this.context.setCaptureMode('drawing')
  }

  handleKeyUp() {
    this.context.captureSelection()
    this.context.queueSelectionCapture()
  }

  handlePointerUp() {
    this.context.captureSelection()
    this.context.queueSelectionCapture()
  }

  handleSelectionChange() {
    this.context.captureSelection()
  }
}

function getElementLabel(element: HTMLElement | null): string | undefined {
  if (!element) return undefined
  const tag = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ''
  const className = typeof element.className === 'string'
    ? element.className.split(/\s+/).filter(Boolean).slice(0, 2).map(name => `.${name}`).join('')
    : ''

  return `${tag}${id}${className}`
}

function getEventTargetLabel(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLElement)) return undefined
  return getElementLabel(target)
}

function getSelectionNodeLabel(node: Node | null): string | undefined {
  if (!node) return undefined
  if (node instanceof HTMLElement) return getElementLabel(node)
  return node.parentElement ? getElementLabel(node.parentElement) : undefined
}

function rectFromDomRect(rect: DOMRect): ReviewCaptureRect {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}

function getStrokeBounds(points: ReviewStrokePoint[]): ReviewStrokeBounds | undefined {
  if (points.length === 0) return undefined
  const xs = points.map(point => point.x)
  const ys = points.map(point => point.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function getDistance(a: ReviewStrokePoint, b: ReviewStrokePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function isCommandModifierKey(event: KeyboardEvent) {
  return event.key === 'Meta' || event.code === 'MetaLeft' || event.code === 'MetaRight'
}

function getRecorderMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ]

  return candidates.find(candidate => (
    typeof MediaRecorder !== 'undefined'
    && MediaRecorder.isTypeSupported(candidate)
  )) ?? ''
}

class BrowserReviewRecorder implements ReviewRecorder {
  private readonly options: Required<Pick<
    ReviewRecorderOptions,
    'captureAudio'
    | 'captureScreenshots'
    | 'timeLimitMs'
    | 'captureMode'
    | 'pointerMoveThrottleMs'
    | 'strokeColor'
    | 'strokeFadeDelayMs'
    | 'strokeFadeDurationMs'
    | 'strokeWidth'
    | 'overlayZIndex'
  >> & Pick<ReviewRecorderOptions, 'eventTarget'>

  private recording = false
  private captureMode: ReviewCaptureMode
  private captureState: ReviewCaptureStateController
  private drawingEnabled = false
  private drawingInputEnabled = false
  private startedAt = ''
  private startTime = 0
  private eventId = 0
  private strokeId = 0
  private lastPointerMoveAt = 0
  private events: ReviewCaptureEvent[] = []
  private strokes: ReviewStroke[] = []
  private cursor?: ReviewCursorSnapshot
  private selection?: ReviewSelectionSnapshot
  private lastSelection?: ReviewSelectionSnapshot
  private selections: ReviewSelectionSnapshot[] = []
  private lastSelectionKey = ''
  private listeners = new Set<ReviewCaptureListener>()
  private disposers: Array<() => void> = []
  private overlayDisposers: Array<() => void> = []
  private overlayCanvas?: HTMLCanvasElement
  private overlayContext?: CanvasRenderingContext2D
  private overlayAnimationFrame?: number
  private strokeCandidate?: StrokeCandidate
  private activeStroke?: ReviewStroke
  private strokeFadeWindows = new Map<string, StrokeFadeWindow>()
  private stream?: MediaStream
  private mediaRecorder?: MediaRecorder
  private audioChunks: Blob[] = []
  private audioMimeType = ''
  private imageCapture?: ImageCapture
  private screenshots: ReviewScreenshot[] = []
  private screenshotId = 0
  private timeLimitReached = false
  private timeLimitTimer?: number
  private sessionContext?: ReviewSessionContext
  private lastKnownUrl = ''
  private lastKnownTitle = ''
  private originalPushState?: typeof history.pushState
  private originalReplaceState?: typeof history.replaceState
  private titleObserver?: MutationObserver
  private pendingPointerEvent?: ReviewCaptureEvent
  private pendingPointerNotification?: number
  private readonly stateContext: ReviewCaptureStateContext = {
    captureSelection: () => this.captureSelection(),
    clearCurrentSelection: () => this.clearCurrentSelection(),
    disableDrawingInput: () => this.disableDrawingInput(),
    disableDrawingSurface: () => this.disableDrawingSurface(),
    enableDrawingInput: () => this.enableDrawingInput(),
    enableDrawingSurface: () => this.enableDrawingSurface(),
    queueSelectionCapture: () => this.queueSelectionCapture(),
    setCaptureMode: mode => this.setCaptureMode(mode),
  }

  constructor(options: ReviewRecorderOptions = {}) {
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
    }
    this.captureMode = this.options.captureMode
    this.captureState = this.createCaptureState(this.captureMode)
  }

  async start() {
    if (this.recording) return

    this.recording = true
    this.startedAt = new Date().toISOString()
    this.startTime = performance.now()
    this.eventId = 0
    this.lastPointerMoveAt = 0
    this.captureMode = this.options.captureMode
    this.captureState = this.createCaptureState(this.captureMode)
    this.drawingEnabled = false
    this.drawingInputEnabled = false
    this.cancelOverlayAnimation()
    this.events = []
    this.strokes = []
    this.strokeFadeWindows.clear()
    this.cursor = undefined
    this.selection = undefined
    this.lastSelection = undefined
    this.selections = []
    this.lastSelectionKey = ''
    this.audioChunks = []
    this.screenshots = []
    this.screenshotId = 0
    this.timeLimitReached = false
    this.lastKnownUrl = this.targetWindow.location.href
    this.lastKnownTitle = this.document.title
    this.sessionContext = {
      url: this.lastKnownUrl,
      title: this.lastKnownTitle,
      scrollX: Math.round(this.targetWindow.scrollX),
      scrollY: Math.round(this.targetWindow.scrollY),
      viewportWidth: this.targetWindow.innerWidth,
      viewportHeight: this.targetWindow.innerHeight,
    }
    this.bindPassiveRecordingEvents()
    this.bindNavigationCapture()

    if (this.options.timeLimitMs > 0) {
      this.timeLimitTimer = this.targetWindow.setTimeout(() => {
        this.timeLimitReached = true
        this.log({ type: 'time-limit-reached', timeLimitMs: this.options.timeLimitMs })
        void this.stop()
      }, this.options.timeLimitMs)
      this.disposers.push(() => {
        if (this.timeLimitTimer !== undefined) {
          this.targetWindow.clearTimeout(this.timeLimitTimer)
          this.timeLimitTimer = undefined
        }
      })
    }

    this.captureState.enter()
    this.log({ type: 'recording-started' })
    this.log({
      type: 'session-start',
      url: this.sessionContext!.url,
      title: this.sessionContext!.title,
      scrollX: this.sessionContext!.scrollX,
      scrollY: this.sessionContext!.scrollY,
      viewportWidth: this.sessionContext!.viewportWidth,
      viewportHeight: this.sessionContext!.viewportHeight,
    })

    await this.startMediaCapture()
  }

  async stop() {
    if (!this.recording) {
      return this.buildResult()
    }

    this.captureState.exit()
    this.unmountOverlay()
    this.drawingInputEnabled = false
    this.drawingEnabled = false
    this.recording = false
    this.log({ type: 'recording-stopped' })
    this.clearPendingPointerNotification()
    this.disposers.forEach(dispose => dispose())
    this.disposers = []
    this.imageCapture = undefined
    this.titleObserver?.disconnect()
    this.titleObserver = undefined
    if (this.originalPushState) {
      this.targetWindow.history.pushState = this.originalPushState
      this.originalPushState = undefined
    }
    if (this.originalReplaceState) {
      this.targetWindow.history.replaceState = this.originalReplaceState
      this.originalReplaceState = undefined
    }
    await this.stopMediaCapture()

    return this.buildResult()
  }

  setCaptureMode(mode: ReviewCaptureMode) {
    if (this.captureMode === mode) return

    this.captureState.exit()
    this.captureMode = mode
    this.captureState = this.createCaptureState(mode)

    if (this.recording) this.captureState.enter()

    this.log({ type: 'capture-mode-changed', mode })
  }

  setDrawingEnabled(enabled: boolean) {
    if (enabled) {
      this.enableDrawingSurface()
      return
    }

    this.disableDrawingSurface()
  }

  setDrawingInputEnabled(enabled: boolean) {
    if (enabled) {
      this.enableDrawingInput()
      return
    }

    this.disableDrawingInput()
  }

  getSnapshot(): ReviewCaptureSnapshot {
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
    }
  }

  subscribe(listener: ReviewCaptureListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private createCaptureState(mode: ReviewCaptureMode): ReviewCaptureStateController {
    return mode === 'drawing'
      ? new DrawingCaptureState(this.stateContext)
      : new HighlightCaptureState(this.stateContext)
  }

  private get targetWindow() {
    return this.options.eventTarget ?? window
  }

  private get document() {
    return this.targetWindow.document
  }

  private getElapsedMs() {
    return Math.round(performance.now() - this.startTime)
  }

  private log(event: ReviewCaptureEventInput) {
    const entry = {
      id: ++this.eventId,
      at: new Date().toISOString(),
      elapsedMs: this.getElapsedMs(),
      ...event,
    } as ReviewCaptureEvent

    this.events.push(entry)
    this.notifyListeners(entry)
  }

  private notifyListeners(entry: ReviewCaptureEvent) {
    if (this.isPointerCaptureEvent(entry)) {
      this.pendingPointerEvent = entry
      if (this.pendingPointerNotification !== undefined) {
        this.targetWindow.clearTimeout(this.pendingPointerNotification)
      }

      this.pendingPointerNotification = this.targetWindow.setTimeout(() => {
        const pendingEvent = this.pendingPointerEvent
        this.pendingPointerEvent = undefined
        this.pendingPointerNotification = undefined
        if (!pendingEvent) return
        this.publishSnapshot(pendingEvent)
      }, 180)
      return
    }

    this.publishSnapshot(entry)
  }

  private publishSnapshot(entry: ReviewCaptureEvent) {
    const snapshot = this.getSnapshot()
    this.listeners.forEach(listener => listener(entry, snapshot))
  }

  private clearPendingPointerNotification() {
    if (this.pendingPointerNotification !== undefined) {
      this.targetWindow.clearTimeout(this.pendingPointerNotification)
    }

    this.pendingPointerEvent = undefined
    this.pendingPointerNotification = undefined
  }

  private isPointerCaptureEvent(event: ReviewCaptureEvent): event is ReviewPointerCaptureEvent {
    return (
      event.type === 'pointer-move'
      || event.type === 'pointer-down'
      || event.type === 'pointer-up'
      || event.type === 'click'
    )
  }

  private logNavigation(
    trigger: ReviewNavigationTrigger,
    fromUrl: string,
    fromTitle: string,
  ) {
    const toUrl = this.targetWindow.location.href
    const toTitle = this.document.title
    this.lastKnownUrl = toUrl
    this.lastKnownTitle = toTitle
    this.log({
      type: 'navigation',
      trigger,
      fromUrl,
      fromTitle,
      toUrl,
      toTitle,
      scrollX: Math.round(this.targetWindow.scrollX),
      scrollY: Math.round(this.targetWindow.scrollY),
    })
  }

  private bindNavigationCapture() {
    const target = this.targetWindow
    const doc = this.document

    // Patch pushState / replaceState to intercept SPA navigation
    this.originalPushState = target.history.pushState.bind(target.history)
    this.originalReplaceState = target.history.replaceState.bind(target.history)

    target.history.pushState = (state: unknown, unused: string, url?: string | URL | null) => {
      const fromUrl = this.lastKnownUrl
      const fromTitle = this.lastKnownTitle
      this.originalPushState!(state, unused, url)
      this.logNavigation('pushstate', fromUrl, fromTitle)
    }

    target.history.replaceState = (state: unknown, unused: string, url?: string | URL | null) => {
      const fromUrl = this.lastKnownUrl
      const fromTitle = this.lastKnownTitle
      this.originalReplaceState!(state, unused, url)
      this.logNavigation('replacestate', fromUrl, fromTitle)
    }

    // popstate — browser back / forward
    const onPopState = () => {
      this.logNavigation('popstate', this.lastKnownUrl, this.lastKnownTitle)
    }
    target.addEventListener('popstate', onPopState)
    this.disposers.push(() => target.removeEventListener('popstate', onPopState))

    // hashchange — hash-based routing
    const onHashChange = () => {
      this.logNavigation('hashchange', this.lastKnownUrl, this.lastKnownTitle)
    }
    target.addEventListener('hashchange', onHashChange)
    this.disposers.push(() => target.removeEventListener('hashchange', onHashChange))

    // visibilitychange — tab hidden / shown
    const onVisibility = () => {
      if (!this.recording) return
      this.log({
        type: 'visibility-change',
        state: doc.visibilityState === 'hidden' ? 'hidden' : 'visible',
      })
    }
    doc.addEventListener('visibilitychange', onVisibility)
    this.disposers.push(() => doc.removeEventListener('visibilitychange', onVisibility))

    // MutationObserver on <title> — catches SPA title updates without URL changes
    const titleEl = doc.querySelector('title')
    if (titleEl) {
      this.titleObserver = new MutationObserver(() => {
        if (!this.recording) return
        const newTitle = doc.title
        if (newTitle !== this.lastKnownTitle) {
          const fromUrl = this.lastKnownUrl
          const fromTitle = this.lastKnownTitle
          this.lastKnownTitle = newTitle
          this.log({
            type: 'navigation',
            trigger: 'title-change',
            fromUrl,
            fromTitle,
            toUrl: this.lastKnownUrl,
            toTitle: newTitle,
            scrollX: Math.round(target.scrollX),
            scrollY: Math.round(target.scrollY),
          })
        }
      })
      this.titleObserver.observe(titleEl, { childList: true, characterData: true, subtree: true })
    }
  }

  private bindPassiveRecordingEvents() {
    const target = this.targetWindow
    const doc = this.document
    const passiveOptions: AddEventListenerOptions = { passive: true }
    const addWindowListener = <K extends keyof WindowEventMap>(
      type: K,
      handler: (event: WindowEventMap[K]) => void,
      options: AddEventListenerOptions = passiveOptions,
    ) => {
      target.addEventListener(type, handler, options)
      this.disposers.push(() => target.removeEventListener(type, handler, options))
    }
    const addDocumentListener = (type: 'selectionchange', handler: (event: Event) => void) => {
      doc.addEventListener(type, handler)
      this.disposers.push(() => doc.removeEventListener(type, handler))
    }

    addWindowListener('pointermove', event => {
      this.cursor = this.getCursorSnapshot(event)
      const elapsed = performance.now() - this.startTime
      if (elapsed - this.lastPointerMoveAt < this.options.pointerMoveThrottleMs) return
      this.lastPointerMoveAt = elapsed
      this.logPointerEvent('pointer-move', event)
    })
    addWindowListener('pointerdown', event => {
      this.cursor = this.getCursorSnapshot(event)
      this.logPointerEvent('pointer-down', event)
    })
    addWindowListener('pointerup', event => {
      this.cursor = this.getCursorSnapshot(event)
      this.logPointerEvent('pointer-up', event)
      this.captureState.handlePointerUp(event)
    })
    addWindowListener('click', event => this.logPointerEvent('click', event))
    addWindowListener('keyup', event => this.captureState.handleKeyUp(event))
    addWindowListener('blur', () => {
      if (this.captureMode === 'drawing') this.setCaptureMode('highlight')
    })
    addWindowListener('keydown', event => {
      this.log({
        type: 'key-down',
        key: event.key,
        code: event.code,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      })
      this.captureState.handleKeyDown(event)
    }, {})
    addDocumentListener('selectionchange', () => this.captureState.handleSelectionChange())
  }

  private getCursorSnapshot(event: PointerEvent | MouseEvent): ReviewCursorSnapshot {
    return {
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      at: new Date().toISOString(),
      elapsedMs: this.getElapsedMs(),
    }
  }

  private getPoint(event: PointerEvent | MouseEvent): ReviewStrokePoint {
    return {
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      elapsedMs: this.getElapsedMs(),
    }
  }

  private logPointerEvent(type: ReviewPointerCaptureEvent['type'], event: PointerEvent | MouseEvent) {
    this.cursor = this.getCursorSnapshot(event)
    this.log({
      type,
      x: this.cursor.x,
      y: this.cursor.y,
      pointerType: 'pointerType' in event ? event.pointerType : 'mouse',
      buttons: event.buttons,
      target: getEventTargetLabel(event.target),
    })
  }

  private captureSelection() {
    if (this.captureMode !== 'highlight') return

    const selection = this.document.getSelection()
    const text = selection?.toString() ?? ''

    if (!selection || text.length === 0 || selection.rangeCount === 0) {
      if (!this.selection && this.lastSelectionKey === '') return
      this.selection = undefined
      this.lastSelectionKey = ''
      this.log({ type: 'selection-change', selection: undefined })
      return
    }

    const range = selection.getRangeAt(0)
    const rects = Array.from(range.getClientRects())
      .filter(rect => rect.width > 0 || rect.height > 0)
      .map(rectFromDomRect)

    const nextSelection: ReviewSelectionSnapshot = {
      text,
      anchor: getSelectionNodeLabel(selection.anchorNode),
      focus: getSelectionNodeLabel(selection.focusNode),
      capturedAt: new Date().toISOString(),
      elapsedMs: this.getElapsedMs(),
      rects,
    }
    const selectionKey = JSON.stringify({
      text: nextSelection.text,
      anchor: nextSelection.anchor,
      focus: nextSelection.focus,
      rects: nextSelection.rects,
    })

    if (selectionKey === this.lastSelectionKey) return
    this.selection = nextSelection
    this.lastSelection = nextSelection
    this.selections.push(nextSelection)
    this.lastSelectionKey = selectionKey
    this.log({ type: 'selection-change', selection: nextSelection })
    void this.takeScreenshot('selection', selectionKey.slice(0, 64))
  }

  private clearCurrentSelection() {
    this.selection = undefined
    this.lastSelectionKey = ''
  }

  private queueSelectionCapture() {
    this.targetWindow.setTimeout(() => {
      if (this.recording) this.captureSelection()
    }, 48)
  }

  private mountOverlay() {
    if (this.overlayCanvas) return

    const canvas = this.document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    canvas.setAttribute('aria-hidden', 'true')
    canvas.dataset.zenithReviewDrawingOverlay = 'true'
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
    })

    this.overlayCanvas = canvas
    this.overlayContext = context
    this.document.body.append(canvas)
    this.resizeOverlay()
    this.syncOverlayInputState()
    this.bindOverlayEvents(canvas)
  }

  private bindOverlayEvents(canvas: HTMLCanvasElement) {
    const addOverlayListener = <K extends keyof HTMLElementEventMap>(
      type: K,
      handler: (event: HTMLElementEventMap[K]) => void,
    ) => {
      canvas.addEventListener(type, handler)
      this.overlayDisposers.push(() => canvas.removeEventListener(type, handler))
    }

    addOverlayListener('pointerdown', event => this.handleOverlayPointerDown(event as PointerEvent))
    addOverlayListener('pointermove', event => this.handleOverlayPointerMove(event as PointerEvent))
    addOverlayListener('pointerup', event => this.handleOverlayPointerUp(event as PointerEvent))
    addOverlayListener('pointercancel', event => this.handleOverlayPointerUp(event as PointerEvent))
    this.targetWindow.addEventListener('resize', this.resizeOverlay, { passive: true })
    this.overlayDisposers.push(() => this.targetWindow.removeEventListener('resize', this.resizeOverlay))
  }

  private resizeOverlay = () => {
    const canvas = this.overlayCanvas
    const context = this.overlayContext
    if (!canvas || !context) return

    const dpr = this.targetWindow.devicePixelRatio || 1
    const width = this.targetWindow.innerWidth
    const height = this.targetWindow.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.redrawOverlay()
  }

  private unmountOverlay() {
    this.overlayDisposers.forEach(dispose => dispose())
    this.overlayDisposers = []
    this.cancelOverlayAnimation()
    this.overlayCanvas?.remove()
    this.overlayCanvas = undefined
    this.overlayContext = undefined
    this.strokeCandidate = undefined
    this.activeStroke = undefined
  }

  private handleOverlayPointerDown(event: PointerEvent) {
    if (!this.drawingInputEnabled) return

    event.preventDefault()
    this.overlayCanvas?.setPointerCapture(event.pointerId)
    this.cursor = this.getCursorSnapshot(event)
    this.strokeCandidate = {
      id: `stroke-${++this.strokeId}`,
      startedAt: new Date().toISOString(),
      points: [this.getPoint(event)],
    }
    this.activeStroke = {
      id: this.strokeCandidate.id,
      startedAt: this.strokeCandidate.startedAt,
      points: [...this.strokeCandidate.points],
    }
    this.strokeFadeWindows.delete(this.activeStroke.id)
    this.strokes.push(this.activeStroke)
    this.redrawOverlay()
    this.log({
      type: 'stroke-started',
      strokeId: this.activeStroke.id,
      x: this.activeStroke.points[0].x,
      y: this.activeStroke.points[0].y,
      pointCount: this.activeStroke.points.length,
    })
  }

  private handleOverlayPointerMove(event: PointerEvent) {
    if (!this.drawingInputEnabled) return
    if (!this.activeStroke || !this.strokeCandidate) return
    event.preventDefault()
    this.cursor = this.getCursorSnapshot(event)

    const nextPoint = this.getPoint(event)
    const lastPoint = this.activeStroke.points[this.activeStroke.points.length - 1]
    if (lastPoint && getDistance(lastPoint, nextPoint) < 2) return

    this.strokeCandidate.points.push(nextPoint)
    this.activeStroke.points.push(nextPoint)
    this.activeStroke.bounds = getStrokeBounds(this.activeStroke.points)
    this.redrawOverlay()
    this.log({
      type: 'stroke-point',
      strokeId: this.activeStroke.id,
      x: nextPoint.x,
      y: nextPoint.y,
      pointCount: this.activeStroke.points.length,
      bounds: this.activeStroke.bounds,
    })
  }

  private handleOverlayPointerUp(event: PointerEvent) {
    if (!this.drawingInputEnabled) return
    if (!this.activeStroke) return
    event.preventDefault()
    this.cursor = this.getCursorSnapshot(event)
    this.finishStrokeCandidate(event)
  }

  private enableDrawingSurface() {
    if (this.captureMode !== 'drawing' || this.drawingEnabled) return

    this.drawingEnabled = true
    if (!this.recording) return

    this.mountOverlay()
    this.syncOverlayInputState()
    this.log({ type: 'drawing-enabled' })
  }

  private disableDrawingSurface() {
    if (!this.drawingEnabled) return

    this.disableDrawingInput()
    this.finishStrokeCandidate()
    this.drawingEnabled = false
    this.syncOverlayInputState()

    if (this.recording) this.log({ type: 'drawing-disabled' })

    if (this.hasActiveStrokeFades()) {
      this.scheduleOverlayAnimation()
      return
    }

    this.unmountOverlay()
  }

  private enableDrawingInput() {
    if (
      !this.recording
      || this.captureMode !== 'drawing'
      || !this.drawingEnabled
      || this.drawingInputEnabled
    ) return

    this.drawingInputEnabled = true
    this.syncOverlayInputState()
    this.log({ type: 'drawing-input-enabled' })
  }

  private disableDrawingInput() {
    if (!this.drawingInputEnabled) return

    this.drawingInputEnabled = false
    this.syncOverlayInputState()
    this.finishStrokeCandidate()
    this.log({ type: 'drawing-input-disabled' })
  }

  private syncOverlayInputState() {
    const canvas = this.overlayCanvas
    if (!canvas) return

    canvas.style.pointerEvents = this.drawingInputEnabled ? 'auto' : 'none'
    canvas.style.cursor = this.drawingInputEnabled ? 'crosshair' : 'default'
  }

  private finishStrokeCandidate(event?: PointerEvent) {
    if (this.activeStroke && event) {
      const nextPoint = this.getPoint(event)
      const lastPoint = this.activeStroke.points[this.activeStroke.points.length - 1]

      if (!lastPoint || getDistance(lastPoint, nextPoint) >= 2) {
        this.activeStroke.points.push(nextPoint)
      }
    }

    if (this.activeStroke) {
      this.activeStroke.endedAt = new Date().toISOString()
      this.activeStroke.bounds = getStrokeBounds(this.activeStroke.points)
      this.beginStrokeFade(this.activeStroke.id)
      this.redrawOverlay()
      this.log({
        type: 'stroke-ended',
        strokeId: this.activeStroke.id,
        x: this.activeStroke.points.at(-1)?.x,
        y: this.activeStroke.points.at(-1)?.y,
        pointCount: this.activeStroke.points.length,
        bounds: this.activeStroke.bounds,
      })
      void this.takeScreenshot('stroke', this.activeStroke.id)
    }

    this.strokeCandidate = undefined
    this.activeStroke = undefined
  }

  private beginStrokeFade(strokeId: string) {
    const fadeStart = performance.now() + this.options.strokeFadeDelayMs
    const fadeEnd = fadeStart + this.options.strokeFadeDurationMs
    this.strokeFadeWindows.set(strokeId, { fadeStart, fadeEnd })
    this.scheduleOverlayAnimation()
  }

  private scheduleOverlayAnimation() {
    if (this.overlayAnimationFrame !== undefined || !this.overlayCanvas) return

    this.overlayAnimationFrame = this.targetWindow.requestAnimationFrame(this.handleOverlayAnimationFrame)
  }

  private handleOverlayAnimationFrame = () => {
    this.overlayAnimationFrame = undefined
    this.redrawOverlay()

    if (this.hasActiveStrokeFades()) {
      this.scheduleOverlayAnimation()
      return
    }

    if (!this.drawingEnabled) this.unmountOverlay()
  }

  private cancelOverlayAnimation() {
    if (this.overlayAnimationFrame === undefined) return

    this.targetWindow.cancelAnimationFrame(this.overlayAnimationFrame)
    this.overlayAnimationFrame = undefined
  }

  private hasActiveStrokeFades() {
    const now = performance.now()
    return Array.from(this.strokeFadeWindows.values())
      .some(fadeWindow => now < fadeWindow.fadeEnd)
  }

  private getStrokeOpacity(stroke: ReviewStroke) {
    if (this.activeStroke?.id === stroke.id) return 1

    const fadeWindow = this.strokeFadeWindows.get(stroke.id)
    if (!fadeWindow) return 1

    const now = performance.now()
    if (now < fadeWindow.fadeStart) return 1
    if (now >= fadeWindow.fadeEnd) return 0

    const fadeDuration = Math.max(1, fadeWindow.fadeEnd - fadeWindow.fadeStart)
    return 1 - ((now - fadeWindow.fadeStart) / fadeDuration)
  }

  private drawStroke(stroke: ReviewStroke, opacity = 1) {
    const context = this.overlayContext
    if (!context || stroke.points.length === 0 || opacity <= 0) return

    context.save()
    context.globalAlpha = opacity
    context.strokeStyle = this.options.strokeColor
    context.fillStyle = this.options.strokeColor
    context.lineWidth = this.options.strokeWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()

    const [firstPoint, ...remainingPoints] = stroke.points
    if (remainingPoints.length === 0) {
      context.arc(firstPoint.x, firstPoint.y, this.options.strokeWidth / 2, 0, Math.PI * 2)
      context.fill()
      context.restore()
      return
    }

    context.moveTo(firstPoint.x, firstPoint.y)
    remainingPoints.forEach(point => context.lineTo(point.x, point.y))
    context.stroke()
    context.restore()
  }

  private redrawOverlay() {
    const context = this.overlayContext
    const canvas = this.overlayCanvas
    if (!context || !canvas) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    this.strokes.forEach(stroke => {
      this.drawStroke(stroke, this.getStrokeOpacity(stroke))
    })
  }

  private async startMediaCapture() {
    // When captureScreenshots is enabled, use getDisplayMedia to get screen video + audio
    // in a single permission request. Fall back to getUserMedia (audio only) on denial.
    if (this.options.captureScreenshots) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 1 },
          audio: this.options.captureAudio,
        })
        this.stream = displayStream

        const videoTracks = displayStream.getVideoTracks()
        if (videoTracks[0] && typeof ImageCapture !== 'undefined') {
          this.imageCapture = new ImageCapture(videoTracks[0])
        }

        // If getDisplayMedia returned audio, use it. Otherwise fall through to getUserMedia.
        const hasAudio = displayStream.getAudioTracks().length > 0
        if (this.options.captureAudio && !hasAudio) {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            micStream.getAudioTracks().forEach(track => this.stream!.addTrack(track))
          } catch {
            // Mic fallback denied — audio capture skipped
          }
        }
      } catch {
        // getDisplayMedia denied — fall back to audio-only if requested
        if (this.options.captureAudio) {
          try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          } catch (error) {
            this.log({
              type: 'audio-error',
              message: error instanceof Error ? error.message : 'Microphone capture failed.',
            })
          }
        }
      }
    } else if (this.options.captureAudio) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (error) {
        this.log({
          type: 'audio-error',
          message: error instanceof Error ? error.message : 'Microphone capture failed.',
        })
      }
    }

    if (this.options.captureAudio && this.stream) {
      const audioTracks = this.stream.getAudioTracks()
      if (audioTracks.length > 0) {
        // Build an audio-only stream for MediaRecorder
        const audioStream = new MediaStream(audioTracks)
        this.audioMimeType = getRecorderMimeType()
        this.mediaRecorder = new MediaRecorder(
          audioStream,
          this.audioMimeType ? { mimeType: this.audioMimeType } : undefined,
        )
        this.mediaRecorder.addEventListener('dataavailable', event => {
          if (event.data.size === 0) return
          this.audioChunks.push(event.data)
          this.log({
            type: 'audio-chunk',
            mimeType: event.data.type || this.audioMimeType || 'audio/webm',
            size: event.data.size,
          })
        })
        this.mediaRecorder.start(1000)
      }
    }
  }

  private async stopMediaCapture() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      await new Promise<void>(resolve => {
        this.mediaRecorder?.addEventListener('stop', () => resolve(), { once: true })
        this.mediaRecorder?.stop()
      })
    }

    this.stream?.getTracks().forEach(track => track.stop())
    this.stream = undefined
    this.mediaRecorder = undefined
  }

  private async takeScreenshot(trigger: 'stroke' | 'selection', refId: string) {
    const imageCapture = this.imageCapture
    if (!imageCapture) return

    try {
      const bitmap = await imageCapture.grabFrame()
      const canvas = this.document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
      bitmap.close()

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/webp', 0.85),
      )
      if (!blob) return

      const screenshot: ReviewScreenshot = {
        id: `screenshot-${++this.screenshotId}`,
        trigger,
        refId,
        capturedAt: new Date().toISOString(),
        elapsedMs: this.getElapsedMs(),
        blob,
        width: bitmap.width,
        height: bitmap.height,
      }
      this.screenshots.push(screenshot)
      this.log({
        type: 'screenshot-captured',
        screenshotId: screenshot.id,
        trigger,
        refId,
        width: screenshot.width,
        height: screenshot.height,
      })
    } catch {
      // Screenshot capture failures are non-fatal — the review continues
    }
  }

  private buildResult(): ReviewRecordingResult {
    const stoppedAt = new Date().toISOString()
    const audioBlob = this.audioChunks.length > 0
      ? new Blob(this.audioChunks, { type: this.audioMimeType || this.audioChunks[0]?.type || 'audio/webm' })
      : undefined

    return {
      startedAt: this.startedAt || stoppedAt,
      stoppedAt,
      durationMs: this.startTime ? this.getElapsedMs() : 0,
      captureMode: this.captureMode,
      sessionContext: this.sessionContext ?? {
        url: this.targetWindow.location.href,
        title: this.document.title,
        scrollX: 0,
        scrollY: 0,
        viewportWidth: this.targetWindow.innerWidth,
        viewportHeight: this.targetWindow.innerHeight,
      },
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
    }
  }
}

export function createReviewRecorder(options?: ReviewRecorderOptions): ReviewRecorder {
  return new BrowserReviewRecorder(options)
}

export interface ReviewSubmitOptions {
  hubUrl: string
  subjectId: string
  submittedBy: string
  reviewId?: string
}

export interface ReviewSubmitResult {
  reviewId: string
  assetIds: string[]
  status: string
}

async function uploadAsset(
  hubUrl: string,
  blob: Blob,
  assetType: string,
  mimeType?: string,
): Promise<string> {
  const form = new FormData()
  form.append('file', new Blob([blob], { type: mimeType ?? blob.type }), 'asset')
  form.append('asset_type', assetType)
  const res = await fetch(`${hubUrl}/v1/reviews/assets`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Asset upload failed: ${res.status}`)
  const data = await res.json() as { asset_id: string }
  return data.asset_id
}

export async function submitReview(
  result: ReviewRecordingResult,
  options: ReviewSubmitOptions,
): Promise<ReviewSubmitResult> {
  const { hubUrl, subjectId, submittedBy } = options
  const reviewId = options.reviewId ?? crypto.randomUUID()
  const assetIds: string[] = []

  const eventsBlob = new Blob([JSON.stringify(result.events)], { type: 'application/json' })
  assetIds.push(await uploadAsset(hubUrl, eventsBlob, 'events', 'application/json'))

  if (result.audio) {
    assetIds.push(await uploadAsset(hubUrl, result.audio.blob, 'audio', result.audio.mimeType))
  }

  const body = {
    review_id: reviewId,
    subject_id: subjectId,
    submitted_by: submittedBy,
    started_at: result.startedAt,
    stopped_at: result.stoppedAt,
    duration_ms: result.durationMs,
    asset_ids: assetIds,
    metadata: {
      stroke_count: result.strokes.length,
      event_count: result.events.length,
      capture_mode: result.captureMode,
    },
  }
  const res = await fetch(`${hubUrl}/v1/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Review submit failed: ${res.status}`)
  const data = await res.json() as { review_id: string; status: string }

  return { reviewId: data.review_id, assetIds, status: data.status }
}
