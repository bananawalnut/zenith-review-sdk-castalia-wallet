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
  | 'recorder-warning'
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
  selectedText?: string
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

export interface ReviewRecorderWarningEvent extends ReviewCaptureEventBase {
  type: 'recorder-warning'
  code: 'capture-state' | 'selection-capture'
  message: string
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
  | ReviewRecorderWarningEvent
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
  events: ReviewCaptureEvent[]
  audio?: ReviewAudioResult
  timeLimitReached: boolean
}

export interface ReviewRecorderOptions {
  captureAudio?: boolean
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

    try {
      this.captureState.enter()
    } catch (error) {
      this.log({
        type: 'recorder-warning',
        code: 'capture-state',
        message: error instanceof Error ? error.message : 'Capture state initialization failed.',
      })
    }
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

    let selection: Selection | null = null
    let text = ''
    try {
      selection = this.document.getSelection()
      text = selection?.toString() ?? ''
    } catch (error) {
      this.log({
        type: 'recorder-warning',
        code: 'selection-capture',
        message: error instanceof Error ? error.message : 'Selection capture failed.',
      })
      return
    }

    if (!selection || text.length === 0 || selection.rangeCount === 0) {
      if (!this.selection && this.lastSelectionKey === '') return
      this.selection = undefined
      this.lastSelectionKey = ''
      this.log({ type: 'selection-change', selection: undefined })
      return
    }

    let range: Range
    let rects: ReviewCaptureRect[]
    try {
      range = selection.getRangeAt(0)
      rects = Array.from(range.getClientRects())
        .filter(rect => rect.width > 0 || rect.height > 0)
        .map(rectFromDomRect)
    } catch (error) {
      this.log({
        type: 'recorder-warning',
        code: 'selection-capture',
        message: error instanceof Error ? error.message : 'Selection geometry capture failed.',
      })
      return
    }

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
    this.log({ type: 'selection-change', selectedText: text, selection: nextSelection })
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

export interface ReviewAuthSessionRequest {
  hubUrl: string
  projectId: string
  deploymentId: string
  email?: string
  accessCode: string
  subjectId: string
}

export interface ReviewAuthSession {
  sessionId: string
  token: string
  expiresAt: string
  projectId: string
  deploymentId: string
  label?: string
}

export interface ReviewAuthSessionStatus {
  authenticated: boolean
  sessionId?: string
  expiresAt?: string
  projectId?: string
  deploymentId?: string
  label?: string
}

export interface ReviewAuthSessionStatusOptions {
  hubUrl: string
  authToken: string
}


export type ReviewAuthSessionStorage = 'none' | 'session'

export interface ReviewAuthOverlayOptions extends Omit<ReviewAuthSessionRequest, 'accessCode' | 'email'> {
  email?: string
  title?: string
  message?: string
  emailPlaceholder?: string
  accessCodePlaceholder?: string
  submitLabel?: string
  cancelLabel?: string
  brandLabel?: string
  zIndex?: number
}

export interface AuthenticateReviewSessionOptions extends ReviewAuthOverlayOptions {
  storage?: ReviewAuthSessionStorage
  storageKey?: string
  validateStoredSession?: boolean
}

function getDefaultReviewAuthStorageKey(options: Pick<ReviewAuthSessionRequest, 'hubUrl' | 'projectId' | 'deploymentId'>): string {
  return `zenith.review-auth.v1:${options.hubUrl.replace(/\/+$/, '')}:${options.projectId}:${options.deploymentId}`
}

function isReviewAuthSessionFresh(session: ReviewAuthSession | null | undefined): session is ReviewAuthSession {
  if (!session?.token) return false
  if (!session.expiresAt) return true
  const expiresAt = Date.parse(session.expiresAt)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export function getStoredReviewAuthSession(storageKey: string): ReviewAuthSession | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return null
    const session = JSON.parse(raw) as ReviewAuthSession
    if (!isReviewAuthSessionFresh(session)) {
      try {
        window.sessionStorage.removeItem(storageKey)
      } catch {
        // Treat storage failures like a missing stored session.
      }
      return null
    }
    return session
  } catch {
    try {
      window.sessionStorage.removeItem(storageKey)
    } catch {
      // Treat storage failures like a missing stored session.
    }
    return null
  }
}

export function storeReviewAuthSession(storageKey: string, session: ReviewAuthSession | null): void {
  if (typeof window === 'undefined') return

  try {
    if (!session) {
      window.sessionStorage.removeItem(storageKey)
      return
    }

    window.sessionStorage.setItem(storageKey, JSON.stringify(session))
  } catch {
    // Auth still works in memory when browser storage is unavailable.
  }
}

export function clearStoredReviewAuthSession(storageKey: string): void {
  storeReviewAuthSession(storageKey, null)
}

async function validateStoredReviewAuthSession(
  options: Pick<ReviewAuthSessionRequest, 'hubUrl' | 'projectId' | 'deploymentId'>,
  session: ReviewAuthSession,
): Promise<ReviewAuthSession | null> {
  try {
    const status = await getReviewAuthSession({ hubUrl: options.hubUrl, authToken: session.token })
    if (
      status.authenticated
      && status.projectId === options.projectId
      && status.deploymentId === options.deploymentId
    ) {
      return session
    }
  } catch {
    // Fall through to fresh overlay auth.
  }
  return null
}

function escapeReviewAuthHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createReviewAuthOverlayStyles(): string {
  return `
    :host { all: initial; color-scheme: dark; }
    *, *::before, *::after { box-sizing: border-box; }
    .zr-backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.22), transparent 32rem),
        radial-gradient(circle at 80% 10%, rgba(245, 158, 11, 0.15), transparent 28rem),
        rgba(3, 7, 18, 0.72);
      backdrop-filter: blur(18px) saturate(1.08);
      -webkit-backdrop-filter: blur(18px) saturate(1.08);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .zr-card {
      width: min(420px, calc(100vw - 32px));
      border: 1px solid rgba(167, 139, 250, 0.42);
      border-radius: 24px;
      background:
        linear-gradient(135deg, rgba(17, 24, 39, 0.96), rgba(10, 13, 24, 0.94)),
        radial-gradient(circle at top left, rgba(245, 158, 11, 0.16), transparent 18rem);
      box-shadow: 0 28px 90px rgba(0, 0, 0, 0.56), 0 0 0 1px rgba(255,255,255,0.04) inset;
      color: #f8fafc;
      overflow: hidden;
    }
    .zr-header { padding: 24px 24px 18px; border-bottom: 1px solid rgba(148, 163, 184, 0.14); }
    .zr-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; color: #c4b5fd; font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
    .zr-mark { width: 26px; height: 26px; border-radius: 9px; display: grid; place-items: center; color: #111827; background: linear-gradient(135deg, #f59e0b, #ec4899 48%, #8b5cf6); font-weight: 900; letter-spacing: 0; box-shadow: 0 0 24px rgba(139, 92, 246, 0.48); }
    h2 { margin: 0; color: #fff; font-size: 24px; line-height: 1.12; font-weight: 760; letter-spacing: -0.035em; }
    p { margin: 10px 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.55; }
    form { display: grid; gap: 16px; padding: 22px 24px 24px; }
    label { display: grid; gap: 8px; color: #a5b4fc; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
    input {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.26);
      border-radius: 14px;
      background: rgba(15, 23, 42, 0.72);
      color: #f8fafc;
      font: 500 15px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      outline: none;
      padding: 13px 14px;
      transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
    }
    input::placeholder { color: rgba(148, 163, 184, 0.72); }
    input:focus { border-color: rgba(245, 158, 11, 0.82); background: rgba(15, 23, 42, 0.95); box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12); }
    .zr-actions { display: flex; gap: 10px; align-items: center; justify-content: flex-end; padding-top: 4px; }
    button { appearance: none; border: 0; border-radius: 999px; cursor: pointer; font: 800 13px/1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: 0.06em; text-transform: uppercase; padding: 13px 16px; }
    button:disabled { cursor: not-allowed; opacity: 0.7; }
    .zr-cancel { background: rgba(148, 163, 184, 0.12); color: #cbd5e1; }
    .zr-submit { min-width: 150px; color: #111827; background: linear-gradient(135deg, #f59e0b, #ec4899 54%, #8b5cf6); box-shadow: 0 12px 26px rgba(236, 72, 153, 0.24); }
    .zr-error { display: none; border: 1px solid rgba(248, 113, 113, 0.36); border-radius: 14px; background: rgba(127, 29, 29, 0.28); color: #fecaca; padding: 11px 12px; font-size: 13px; line-height: 1.4; }
    .zr-error[data-visible="true"] { display: block; }
    @media (max-width: 520px) { .zr-backdrop { padding: 16px; } .zr-header, form { padding-left: 18px; padding-right: 18px; } .zr-actions { flex-direction: column-reverse; align-items: stretch; } button { width: 100%; } }
  `
}

export function openReviewAuthOverlay(options: ReviewAuthOverlayOptions): Promise<ReviewAuthSession> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Review auth overlay requires a browser document'))
  }

  return new Promise((resolve, reject) => {
    const host = document.createElement('div')
    host.style.position = 'fixed'
    host.style.inset = '0'
    host.style.zIndex = String(options.zIndex ?? 2147483200)
    const shadow = host.attachShadow({ mode: 'closed' })

    const style = document.createElement('style')
    style.textContent = createReviewAuthOverlayStyles()
    shadow.append(style)

    const backdrop = document.createElement('div')
    backdrop.className = 'zr-backdrop'
    backdrop.setAttribute('role', 'dialog')
    backdrop.setAttribute('aria-modal', 'true')
    backdrop.setAttribute('aria-labelledby', 'zr-title')
    const brandLabel = escapeReviewAuthHtml(options.brandLabel ?? 'Zenith Review')
    const title = escapeReviewAuthHtml(options.title ?? 'Reviewer access')
    const message = escapeReviewAuthHtml(options.message ?? 'This staging surface is protected. Enter your reviewer code to continue.')
    const emailPlaceholder = escapeReviewAuthHtml(options.emailPlaceholder ?? 'reviewer@example.com')
    const accessCodePlaceholder = escapeReviewAuthHtml(options.accessCodePlaceholder ?? 'Review access code')
    const cancelLabel = escapeReviewAuthHtml(options.cancelLabel ?? 'Cancel')
    const submitLabel = escapeReviewAuthHtml(options.submitLabel ?? 'Authenticate')
    backdrop.innerHTML = `
      <section class="zr-card">
        <div class="zr-header">
          <div class="zr-brand"><span class="zr-mark">Z</span><span>${brandLabel}</span></div>
          <h2 id="zr-title">${title}</h2>
          <p>${message}</p>
        </div>
        <form>
          <label><span>Email optional</span><input name="email" type="email" autocomplete="email" placeholder="${emailPlaceholder}"></label>
          <label><span>Access code</span><input name="accessCode" type="password" autocomplete="one-time-code" required placeholder="${accessCodePlaceholder}"></label>
          <div class="zr-error" role="alert"></div>
          <div class="zr-actions"><button class="zr-cancel" type="button">${cancelLabel}</button><button class="zr-submit" type="submit">${submitLabel}</button></div>
        </form>
      </section>
    `
    shadow.append(backdrop)
    document.body.append(host)

    const form = backdrop.querySelector('form') as HTMLFormElement
    const emailInput = form.elements.namedItem('email') as HTMLInputElement
    const accessCodeInput = form.elements.namedItem('accessCode') as HTMLInputElement
    const submitButton = backdrop.querySelector('.zr-submit') as HTMLButtonElement
    const cancelButton = backdrop.querySelector('.zr-cancel') as HTMLButtonElement
    const errorNode = backdrop.querySelector('.zr-error') as HTMLDivElement
    const initialFocus = accessCodeInput

    let settled = false
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown)
      host.remove()
    }
    const settleReject = (error: Error) => {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }
    const setPending = (pending: boolean) => {
      emailInput.disabled = pending
      accessCodeInput.disabled = pending
      submitButton.disabled = pending
      cancelButton.disabled = pending
      submitButton.textContent = pending ? 'Authenticating…' : (options.submitLabel ?? 'Authenticate')
    }
    const showError = (message: string) => {
      errorNode.textContent = message
      errorNode.dataset.visible = 'true'
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') settleReject(new Error('Review authentication cancelled.'))
    }

    cancelButton.addEventListener('click', () => settleReject(new Error('Review authentication cancelled.')))
    form.addEventListener('submit', event => {
      event.preventDefault()
      const accessCode = accessCodeInput.value.trim()
      if (!accessCode) {
        showError('Enter the reviewer access code.')
        accessCodeInput.focus()
        return
      }

      setPending(true)
      errorNode.dataset.visible = 'false'
      void createReviewAuthSession({
        hubUrl: options.hubUrl,
        projectId: options.projectId,
        deploymentId: options.deploymentId,
        subjectId: options.subjectId,
        email: emailInput.value.trim() || undefined,
        accessCode,
      }).then(session => {
        if (settled) return
        settled = true
        cleanup()
        resolve(session)
      }).catch(error => {
        setPending(false)
        showError(error instanceof Error ? error.message : 'Review authentication failed.')
      })
    })

    document.addEventListener('keydown', handleKeyDown)
    window.setTimeout(() => initialFocus.focus(), 0)
  })
}

export async function authenticateReviewSession(options: AuthenticateReviewSessionOptions): Promise<ReviewAuthSession> {
  const storage = options.storage ?? 'session'
  const storageKey = options.storageKey ?? getDefaultReviewAuthStorageKey(options)

  if (storage === 'session') {
    const storedSession = getStoredReviewAuthSession(storageKey)
    if (storedSession) {
      const validated = options.validateStoredSession === false
        ? storedSession
        : await validateStoredReviewAuthSession(options, storedSession)
      if (validated) return validated
      clearStoredReviewAuthSession(storageKey)
    }
  }

  const session = await openReviewAuthOverlay(options)
  if (storage === 'session') storeReviewAuthSession(storageKey, session)
  return session
}

export type ReviewAuthSessionListener = (session: ReviewAuthSession | null) => void
export type ReviewAuthLoginTrigger = (options: AuthenticateReviewSessionOptions) => Promise<ReviewAuthSession>

export interface ReviewAuthSessionManagerOptions extends AuthenticateReviewSessionOptions {
  onSessionChange?: ReviewAuthSessionListener
  login?: ReviewAuthLoginTrigger
}

export interface ReviewAuthSessionManager {
  readonly session: ReviewAuthSession | null
  getSession(): ReviewAuthSession | null
  restore(): Promise<ReviewAuthSession | null>
  login(): Promise<ReviewAuthSession>
  logout(): void
  validate(): Promise<ReviewAuthSession | null>
  withSession<T>(action: (session: ReviewAuthSession) => Promise<T> | T): Promise<T>
  subscribe(listener: ReviewAuthSessionListener): () => void
}

class BrowserReviewAuthSessionManager implements ReviewAuthSessionManager {
  private currentSession: ReviewAuthSession | null = null
  private readonly listeners = new Set<ReviewAuthSessionListener>()
  private readonly storage: ReviewAuthSessionStorage
  private readonly storageKey: string
  private readonly loginTrigger: ReviewAuthLoginTrigger

  constructor(private readonly options: ReviewAuthSessionManagerOptions) {
    this.storage = options.storage ?? 'session'
    this.storageKey = options.storageKey ?? getDefaultReviewAuthStorageKey(options)
    this.loginTrigger = options.login ?? authenticateReviewSession
    if (options.onSessionChange) this.listeners.add(options.onSessionChange)
  }

  get session(): ReviewAuthSession | null {
    return this.currentSession
  }

  getSession(): ReviewAuthSession | null {
    return this.currentSession
  }

  async restore(): Promise<ReviewAuthSession | null> {
    if (this.storage !== 'session') {
      this.setSession(null)
      return null
    }

    const storedSession = getStoredReviewAuthSession(this.storageKey)
    if (!storedSession) {
      this.setSession(null)
      return null
    }

    const session = this.options.validateStoredSession === false
      ? storedSession
      : await validateStoredReviewAuthSession(this.options, storedSession)

    if (!session) {
      clearStoredReviewAuthSession(this.storageKey)
      this.setSession(null)
      return null
    }

    this.setSession(session)
    return session
  }

  async login(): Promise<ReviewAuthSession> {
    const session = await this.loginTrigger({
      ...this.options,
      storage: 'none',
      storageKey: this.storageKey,
    })
    this.setSession(session)
    return session
  }

  logout(): void {
    clearStoredReviewAuthSession(this.storageKey)
    this.setSession(null)
  }

  async validate(): Promise<ReviewAuthSession | null> {
    if (!this.currentSession) return null
    const session = await validateStoredReviewAuthSession(this.options, this.currentSession)
    if (!session) {
      this.logout()
      return null
    }
    this.setSession(session)
    return session
  }

  async withSession<T>(action: (session: ReviewAuthSession) => Promise<T> | T): Promise<T> {
    const session = this.currentSession ?? await this.restore() ?? await this.login()
    return action(session)
  }

  subscribe(listener: ReviewAuthSessionListener): () => void {
    this.listeners.add(listener)
    listener(this.currentSession)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setSession(session: ReviewAuthSession | null): void {
    this.currentSession = session
    if (this.storage === 'session') storeReviewAuthSession(this.storageKey, session)
    this.listeners.forEach(listener => listener(session))
  }
}

export function createReviewAuthSessionManager(options: ReviewAuthSessionManagerOptions): ReviewAuthSessionManager {
  return new BrowserReviewAuthSessionManager(options)
}

const ZENITH_ADMIN_MARK_PATH = 'M109.356 0H65.3503L0 83.6345V128H65.3503L0 211.637V256H185.25V222.995H34.8395L109.356 128H185.25V94.9946H34.8395L109.356 0Z'
const ZENITH_ADMIN_MARK_GRADIENT_PATH = 'M164.698 0H98.4224L0 125.778V192.501H98.4224L0 318.283V385H279V335.363H52.4707L164.698 192.501H279V142.863H52.4707L164.698 0Z'
export const ZENITH_PRODUCTION_HUB_URL = 'https://hub.zenith-research.ca'

export interface ZenithAdminOverlayOptions {
  manager: ReviewAuthSessionManager
  label?: string
  zIndex?: number
  onOpen?: (session: ReviewAuthSession) => void
  onLoginRequest?: () => void | Promise<void>
  container?: HTMLElement
}

export interface ZenithAdminOverlayHandle {
  destroy(): void
  update(session?: ReviewAuthSession | null): void
}

function createZenithAdminOverlayStyles(): string {
  return `
    :host { all: initial; color-scheme: dark; }
    *, *::before, *::after { box-sizing: border-box; }
    .za-root { position: fixed; right: 18px; top: 50%; z-index: var(--za-z-index); transform: translateY(-50%); isolation: isolate; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .za-root::before { content: ''; position: absolute; inset: -20px; z-index: -1; border-radius: 999px; background: radial-gradient(circle, rgba(3, 7, 18, 0.82) 0%, rgba(3, 7, 18, 0.44) 44%, transparent 72%); filter: blur(8px); pointer-events: none; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .za-button { position: relative; width: 40px; height: 40px; border: 1px solid transparent; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: transparent; color: #f8fafc; cursor: pointer; padding: 0; transition: background 150ms ease, border-color 150ms ease, color 150ms ease; }
    .za-button:hover, .za-button:focus-visible { border-color: transparent; background: transparent; outline: 2px solid #9BFBE3; outline-offset: 2px; }
    .za-mark { position: absolute; display: inline-flex; width: calc(32px * 0.7265625); height: 32px; align-items: center; justify-content: center; transition: opacity 150ms ease, filter 300ms ease, transform 300ms ease; }
    .za-mark svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .za-mark--rest path { fill: #9BFBE3; }
    .za-mark--alive { opacity: 0; transform: scale(0.94); filter: drop-shadow(0 0 0 rgba(155, 251, 227, 0.48)); }
    .za-button:hover .za-mark--rest, .za-button:focus-visible .za-mark--rest { opacity: 0; transform: scale(0.96); }
    .za-button:hover .za-mark--alive, .za-button:focus-visible .za-mark--alive { opacity: 1; animation: za-zenith-pulse 2.4s ease-in-out infinite; }
    .za-tooltip { position: absolute; right: calc(100% + 8px); top: 50%; padding: 4px 8px; transform: translateY(-50%); border: 1px solid rgba(155, 251, 227, 0.28); border-radius: 8px; background: rgba(3, 7, 18, 0.78); color: #f8fafc; box-shadow: 0 18px 54px rgba(0, 0, 0, 0.46); font-size: 11px; font-weight: 700; letter-spacing: 0; opacity: 0; pointer-events: none; white-space: nowrap; backdrop-filter: blur(18px) saturate(1.08); -webkit-backdrop-filter: blur(18px) saturate(1.08); transition: opacity 150ms ease, transform 150ms ease; }
    .za-button:hover .za-tooltip, .za-button:focus-visible .za-tooltip { opacity: 1; transform: translate(-4px, -50%); }
    .za-popover { position: absolute; right: calc(100% + 10px); top: calc(50% + 28px); min-width: 210px; border: 1px solid rgba(155, 251, 227, 0.38); border-radius: 16px; background: rgba(3, 7, 18, 0.88); color: #f8fafc; box-shadow: 0 18px 60px rgba(0, 0, 0, 0.5); backdrop-filter: blur(18px) saturate(1.08); -webkit-backdrop-filter: blur(18px) saturate(1.08); padding: 12px; display: none; }
    .za-root[data-open="true"] .za-popover { display: grid; gap: 8px; }
    .za-eyebrow { color: #9BFBE3; font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
    .za-label { color: #e2e8f0; font-size: 13px; line-height: 1.35; }
    .za-action { border: 1px solid rgba(155, 251, 227, 0.36); border-radius: 10px; background: rgba(155, 251, 227, 0.08); color: #f8fafc; cursor: pointer; font: 700 12px/1 ui-sans-serif, system-ui, sans-serif; padding: 9px 10px; text-align: left; }
    .za-action:hover { background: rgba(155, 251, 227, 0.14); }
    @keyframes za-zenith-pulse { 0%, 100% { filter: drop-shadow(0 0 0 rgba(155, 251, 227, 0.48)); transform: scale(1); } 45% { filter: drop-shadow(0 0 16px rgba(155, 251, 227, 0.48)); transform: scale(1.08); } }
    @media (prefers-reduced-motion: reduce) { .za-button:hover .za-mark--alive, .za-button:focus-visible .za-mark--alive { animation: none; } }
  `
}

export function renderZenithAdminOverlay(options: ZenithAdminOverlayOptions): ZenithAdminOverlayHandle {
  if (typeof document === 'undefined') throw new Error('Zenith admin overlay requires a browser document')

  const host = document.createElement('div')
  const shadow = host.attachShadow({ mode: 'closed' })
  const style = document.createElement('style')
  style.textContent = createZenithAdminOverlayStyles()
  shadow.append(style)

  const root = document.createElement('div')
  root.className = 'za-root'
  root.style.setProperty('--za-z-index', String(options.zIndex ?? 2147483000))
  const gradientId = 'za-zenith-aqua-gradient'
  root.innerHTML = `
    <button class="za-button" type="button" aria-label="Zenith admin" title="Zenith admin">
      <span class="za-mark za-mark--rest" aria-hidden="true"><svg viewBox="0 0 186 256" role="img"><path d="${ZENITH_ADMIN_MARK_PATH}"></path></svg></span>
      <span class="za-mark za-mark--alive" aria-hidden="true"><svg viewBox="0 0 279 385" role="img"><path d="${ZENITH_ADMIN_MARK_GRADIENT_PATH}" fill="url(#${gradientId})"></path><defs><linearGradient id="${gradientId}" x1="139.5" y1="0" x2="139.5" y2="385" gradientUnits="userSpaceOnUse"><stop stop-color="#9BFBE3"></stop><stop offset="1" stop-color="#02B286"></stop></linearGradient></defs></svg></span>
      <span class="za-tooltip">Zenith admin</span>
    </button>
    <section class="za-popover" aria-label="Zenith admin panel">
      <div class="za-eyebrow">Zenith admin</div>
      <div class="za-label"></div>
      <button class="za-action" type="button"></button>
    </section>
  `
  shadow.append(root)
  ;(options.container ?? document.body).append(host)

  const labelNode = root.querySelector('.za-label') as HTMLDivElement
  const button = root.querySelector('.za-button') as HTMLButtonElement
  const action = root.querySelector('.za-action') as HTMLButtonElement
  let session = options.manager.getSession()
  let open = false

  function render(nextSession: ReviewAuthSession | null = options.manager.getSession()) {
    session = nextSession
    labelNode.textContent = session
      ? `${options.label ?? 'Authenticated'}${session.label ? ` · ${session.label}` : ''}`
      : 'Not authenticated'
    action.textContent = session ? 'Open admin panel' : 'Log in'
    root.dataset.open = open ? 'true' : 'false'
  }

  button.addEventListener('click', () => {
    open = !open
    render(session)
  })
  action.addEventListener('click', () => {
    if (session) {
      options.onOpen?.(session)
      return
    }
    if (options.onLoginRequest) {
      void options.onLoginRequest()
      return
    }
    void options.manager.login()
  })

  const unsubscribe = options.manager.subscribe(nextSession => render(nextSession))
  render(session)

  return {
    destroy() {
      unsubscribe()
      host.remove()
    },
    update(nextSession?: ReviewAuthSession | null) {
      render(nextSession === undefined ? options.manager.getSession() : nextSession)
    },
  }
}

export interface ReviewHudOptions {
  hubUrl?: string
  projectId: string
  deploymentId: string
  subjectId?: string | (() => string)
  manager?: ReviewAuthSessionManager
  storage?: ReviewAuthSessionStorage
  storageKey?: string
  brandLabel?: string
  title?: string
  message?: string
  accessCodePlaceholder?: string
  captureAudio?: boolean
  zIndex?: number
  onSubmitted?: (result: ReviewSubmitResult) => void
  onError?: (error: Error) => void
}

export interface ReviewHudHandle {
  mount(): void
  unmount(): void
  reveal(): void
  startReview(): Promise<void>
  stopAndSubmit(): Promise<ReviewSubmitResult | null>
  cancelReview(): Promise<void>
  logout(): void
}

type ReviewHudStatus = 'idle' | 'recording' | 'submitting' | 'submitted' | 'error'

function renderLabelValue(node: HTMLElement | null, label: string, value: string): void {
  if (!node) return
  const strong = document.createElement('strong')
  strong.textContent = label
  node.replaceChildren(strong, document.createTextNode(` ${value}`))
}

function createReviewHudStyles(): string {
  return `
    :host { all: initial; color-scheme: dark; }
    *, *::before, *::after { box-sizing: border-box; }
    .zrh-root { position: fixed; right: 18px; bottom: 18px; z-index: var(--zrh-z-index); display: grid; gap: 10px; width: min(360px, calc(100vw - 36px)); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #f8fafc; pointer-events: none; }
    .zrh-card { pointer-events: auto; border: 1px solid rgba(155, 251, 227, 0.38); border-radius: 18px; background: rgba(3, 7, 18, 0.9); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.54); backdrop-filter: blur(18px) saturate(1.08); -webkit-backdrop-filter: blur(18px) saturate(1.08); overflow: hidden; }
    .zrh-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-bottom: 1px solid rgba(148, 163, 184, 0.14); }
    .zrh-brand { display: grid; gap: 3px; min-width: 0; }
    .zrh-eyebrow { color: #9BFBE3; font-size: 10px; font-weight: 850; letter-spacing: 0.16em; text-transform: uppercase; }
    .zrh-title { color: #fff; font-size: 14px; font-weight: 780; line-height: 1.2; }
    .zrh-status { border: 1px solid rgba(155, 251, 227, 0.24); border-radius: 999px; padding: 5px 8px; color: #cbd5e1; background: rgba(15, 23, 42, 0.72); font-size: 11px; font-weight: 700; white-space: nowrap; }
    .zrh-status[data-state="recording"] { color: #fecdd3; border-color: rgba(248, 113, 113, 0.44); background: rgba(127, 29, 29, 0.34); }
    .zrh-body { display: grid; gap: 10px; padding: 12px 14px 14px; }
    .zrh-meta { display: grid; gap: 5px; color: #cbd5e1; font-size: 12px; line-height: 1.4; }
    .zrh-meta strong { color: #f8fafc; font-weight: 760; }
    .zrh-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .zrh-action { border: 1px solid rgba(155, 251, 227, 0.36); border-radius: 10px; background: rgba(155, 251, 227, 0.08); color: #f8fafc; cursor: pointer; font: 750 12px/1 ui-sans-serif, system-ui, sans-serif; padding: 9px 10px; }
    .zrh-action:hover:not(:disabled) { background: rgba(155, 251, 227, 0.14); }
    .zrh-action:disabled { cursor: not-allowed; opacity: 0.52; }
    .zrh-action--danger { border-color: rgba(248, 113, 113, 0.38); background: rgba(127, 29, 29, 0.24); }
    .zrh-error { display: none; color: #fecdd3; font-size: 12px; line-height: 1.4; }
    .zrh-error[data-visible="true"] { display: block; }
  `
}

function formatReviewHudElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60).toString().padStart(2, '0')
  const seconds = (total % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function createReviewHud(options: ReviewHudOptions): ReviewHudHandle {
  if (typeof document === 'undefined') throw new Error('Review HUD requires a browser document')
  const hubUrl = options.hubUrl?.trim() || ZENITH_PRODUCTION_HUB_URL

  const subjectId = () => typeof options.subjectId === 'function'
    ? options.subjectId()
    : options.subjectId || window.location.href
  const storageKey = options.storageKey ?? getDefaultReviewAuthStorageKey({ ...options, hubUrl })
  const manager = options.manager ?? createReviewAuthSessionManager({
    hubUrl,
    projectId: options.projectId,
    deploymentId: options.deploymentId,
    subjectId: subjectId(),
    storage: options.storage ?? 'session',
    storageKey,
    brandLabel: options.brandLabel ?? 'Zenith Review',
    title: options.title ?? 'Reviewer access',
    message: options.message ?? 'Authenticate to start a global review recording for this page.',
    accessCodePlaceholder: options.accessCodePlaceholder ?? 'Review access code',
  })

  let host: HTMLDivElement | null = null
  let root: HTMLDivElement | null = null
  let statusNode: HTMLDivElement | null = null
  let sessionNode: HTMLDivElement | null = null
  let subjectNode: HTMLDivElement | null = null
  let elapsedNode: HTMLDivElement | null = null
  let errorNode: HTMLDivElement | null = null
  let startButton: HTMLButtonElement | null = null
  let submitButton: HTMLButtonElement | null = null
  let cancelButton: HTMLButtonElement | null = null
  let logoutButton: HTMLButtonElement | null = null
  let recorder: ReviewRecorder | null = null
  let status: ReviewHudStatus = 'idle'
  let startedAt = 0
  let elapsedTimer: number | undefined
  let unsubscribe: (() => void) | undefined
  let mounted = false

  function setError(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    status = 'error'
    if (errorNode) {
      errorNode.textContent = err.message
      errorNode.dataset.visible = 'true'
    }
    options.onError?.(err)
    render()
  }

  function clearError() {
    if (!errorNode) return
    errorNode.textContent = ''
    errorNode.dataset.visible = 'false'
  }

  function render() {
    const session = manager.getSession()
    if (statusNode) {
      statusNode.dataset.state = status
      statusNode.textContent = status === 'recording'
        ? 'Recording'
        : status === 'submitting'
          ? 'Submitting'
          : status === 'submitted'
            ? 'Submitted'
            : status === 'error'
              ? 'Needs attention'
              : session
                ? 'Ready'
                : 'Locked'
    }
    renderLabelValue(sessionNode, 'Session', session?.label || 'Not authenticated')
    renderLabelValue(subjectNode, 'Subject', subjectId())
    renderLabelValue(elapsedNode, 'Elapsed', status === 'recording' ? formatReviewHudElapsed(performance.now() - startedAt) : '00:00')
    if (startButton) startButton.disabled = status === 'recording' || status === 'submitting'
    if (submitButton) submitButton.disabled = status !== 'recording'
    if (cancelButton) cancelButton.disabled = status !== 'recording'
    if (logoutButton) logoutButton.disabled = status === 'recording' || status === 'submitting'
    root?.setAttribute('data-state', status)
  }

  function startElapsedTimer() {
    stopElapsedTimer()
    elapsedTimer = window.setInterval(render, 500)
  }

  function stopElapsedTimer() {
    if (elapsedTimer === undefined) return
    window.clearInterval(elapsedTimer)
    elapsedTimer = undefined
  }

  async function startReview() {
    try {
      mount()
      clearError()
      const session = manager.getSession() ?? await manager.restore() ?? await manager.login()
      if (!session) return
      if (recorder) await recorder.stop().catch(() => undefined)
      recorder = createReviewRecorder({
        captureAudio: options.captureAudio ?? false,
        captureMode: 'highlight',
        overlayZIndex: (options.zIndex ?? 2147483000) - 1,
      })
      await recorder.start()
      startedAt = performance.now()
      status = 'recording'
      startElapsedTimer()
      render()
    } catch (error) {
      recorder = null
      stopElapsedTimer()
      setError(error)
    }
  }

  async function stopAndSubmit(): Promise<ReviewSubmitResult | null> {
    if (!recorder) return null
    const current = recorder
    recorder = null
    status = 'submitting'
    stopElapsedTimer()
    render()
    try {
      const recording = await current.stop()
      const session = manager.getSession() ?? await manager.restore()
      if (!session) throw new Error('Review session expired before submission. Authenticate again.')
      const result = await submitReview(recording, {
        hubUrl,
        projectId: options.projectId,
        deploymentId: options.deploymentId,
        subjectId: subjectId(),
        authToken: session.token,
      })
      status = 'submitted'
      options.onSubmitted?.(result)
      render()
      return result
    } catch (error) {
      setError(error)
      return null
    }
  }

  async function cancelReview() {
    const current = recorder
    recorder = null
    stopElapsedTimer()
    if (current) await current.stop().catch(() => undefined)
    status = 'idle'
    render()
  }

  function mount() {
    if (mounted) return
    host = document.createElement('div')
    const shadow = host.attachShadow({ mode: 'closed' })
    const style = document.createElement('style')
    style.textContent = createReviewHudStyles()
    shadow.append(style)
    root = document.createElement('div')
    root.className = 'zrh-root'
    root.style.setProperty('--zrh-z-index', String(options.zIndex ?? 2147483000))
    root.innerHTML = `
      <section class="zrh-card" aria-label="Zenith review HUD">
        <div class="zrh-head">
          <div class="zrh-brand"><div class="zrh-eyebrow">${escapeReviewAuthHtml(options.brandLabel ?? 'Zenith Review')}</div><div class="zrh-title">Global review HUD</div></div>
          <div class="zrh-status"></div>
        </div>
        <div class="zrh-body">
          <div class="zrh-meta"><div data-role="session"></div><div data-role="subject"></div><div data-role="elapsed"></div></div>
          <div class="zrh-actions">
            <button class="zrh-action" data-action="start" type="button">Start recording</button>
            <button class="zrh-action" data-action="submit" type="button">Stop & submit</button>
            <button class="zrh-action zrh-action--danger" data-action="cancel" type="button">Cancel</button>
            <button class="zrh-action" data-action="logout" type="button">Sign out</button>
          </div>
          <div class="zrh-error" role="alert" data-visible="false"></div>
        </div>
      </section>
    `
    shadow.append(root)
    document.body.append(host)
    statusNode = root.querySelector('.zrh-status') as HTMLDivElement
    sessionNode = root.querySelector('[data-role="session"]') as HTMLDivElement
    subjectNode = root.querySelector('[data-role="subject"]') as HTMLDivElement
    elapsedNode = root.querySelector('[data-role="elapsed"]') as HTMLDivElement
    errorNode = root.querySelector('.zrh-error') as HTMLDivElement
    startButton = root.querySelector('[data-action="start"]') as HTMLButtonElement
    submitButton = root.querySelector('[data-action="submit"]') as HTMLButtonElement
    cancelButton = root.querySelector('[data-action="cancel"]') as HTMLButtonElement
    logoutButton = root.querySelector('[data-action="logout"]') as HTMLButtonElement
    startButton.addEventListener('click', () => void startReview())
    submitButton.addEventListener('click', () => void stopAndSubmit())
    cancelButton.addEventListener('click', () => void cancelReview())
    logoutButton.addEventListener('click', () => {
      manager.logout()
      render()
    })
    unsubscribe = manager.subscribe(() => render())
    void manager.restore().catch(() => manager.logout())
    mounted = true
    render()
  }

  function unmount() {
    void cancelReview()
    host?.remove()
    host = null
    root = null
    unsubscribe?.()
    unsubscribe = undefined
    mounted = false
  }

  function reveal() {
    mount()
    render()
  }

  return {
    mount,
    unmount,
    reveal,
    startReview,
    stopAndSubmit,
    cancelReview,
    logout() {
      manager.logout()
      render()
    },
  }
}

export interface ReviewSubmitOptions {
  hubUrl: string
  subjectId: string
  submittedBy?: string
  projectId: string
  deploymentId: string
  authToken: string
  reviewId?: string
  signal?: AbortSignal
}

export interface ReviewSubmitResult {
  reviewId: string
  assetIds: string[]
  status: string
}

type ReviewAuthSessionResponse = {
  session_id: string
  token: string
  expires_at: string
  project_id: string
  deployment_id: string
  label?: string
}

type ReviewAuthSessionStatusResponse = {
  authenticated: boolean
  session_id?: string
  expires_at?: string
  project_id?: string
  deployment_id?: string
  label?: string
}

interface UploadAssetOptions {
  hubUrl: string
  projectId: string
  deploymentId: string
  authToken: string
  signal?: AbortSignal
}

function buildHubUrl(hubUrl: string, path: string): string {
  return `${hubUrl.replace(/\/+$/, '')}${path}`
}

async function fetchReviewHub(url: string, init: RequestInit, label: string): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${label} network failed: ${message}`)
  }
}

function requireReviewAuthOptions(options: Pick<ReviewSubmitOptions, 'projectId' | 'deploymentId' | 'authToken'>): void {
  if (!options.projectId) throw new Error('Review submit requires projectId')
  if (!options.deploymentId) throw new Error('Review submit requires deploymentId')
  if (!options.authToken) throw new Error('Review submit requires authToken from createReviewAuthSession')
}

function normalizeReviewAuthSession(data: ReviewAuthSessionResponse): ReviewAuthSession {
  return {
    sessionId: data.session_id,
    token: data.token,
    expiresAt: data.expires_at,
    projectId: data.project_id,
    deploymentId: data.deployment_id,
    label: data.label,
  }
}

function normalizeReviewAuthSessionStatus(data: ReviewAuthSessionStatusResponse): ReviewAuthSessionStatus {
  return {
    authenticated: data.authenticated,
    sessionId: data.session_id,
    expiresAt: data.expires_at,
    projectId: data.project_id,
    deploymentId: data.deployment_id,
    label: data.label,
  }
}

export async function createReviewAuthSession(options: ReviewAuthSessionRequest): Promise<ReviewAuthSession> {
  const body = {
    project_id: options.projectId,
    deployment_id: options.deploymentId,
    email: options.email,
    access_code: options.accessCode,
    subject_id: options.subjectId,
  }

  const res = await fetchReviewHub(buildHubUrl(options.hubUrl, '/v1/review-auth/session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, 'Review auth session')
  if (!res.ok) throw new Error(`Review auth session failed: ${res.status}`)

  return normalizeReviewAuthSession(await res.json() as ReviewAuthSessionResponse)
}

export async function getReviewAuthSession(options: ReviewAuthSessionStatusOptions): Promise<ReviewAuthSessionStatus> {
  const res = await fetchReviewHub(buildHubUrl(options.hubUrl, '/v1/review-auth/session'), {
    method: 'GET',
    headers: { Authorization: `Bearer ${options.authToken}` },
  }, 'Review auth session status')
  if (!res.ok) throw new Error(`Review auth session status failed: ${res.status}`)

  return normalizeReviewAuthSessionStatus(await res.json() as ReviewAuthSessionStatusResponse)
}

async function uploadAsset(
  options: UploadAssetOptions,
  blob: Blob,
  assetType: string,
  mimeType?: string,
): Promise<string> {
  const form = new FormData()
  form.append('file', new Blob([blob], { type: mimeType ?? blob.type }), 'asset')
  form.append('asset_type', assetType)
  form.append('project_id', options.projectId)
  form.append('deployment_id', options.deploymentId)
  const res = await fetchReviewHub(buildHubUrl(options.hubUrl, '/v1/reviews/assets'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${options.authToken}` },
    body: form,
    signal: options.signal,
  }, `Review ${assetType} asset upload`)
  if (!res.ok) throw new Error(`Asset upload failed: ${res.status}`)
  const data = await res.json() as { asset_id: string }
  return data.asset_id
}

export async function submitReview(
  result: ReviewRecordingResult,
  options: ReviewSubmitOptions,
): Promise<ReviewSubmitResult> {
  requireReviewAuthOptions(options)

  const { hubUrl, subjectId, submittedBy, projectId, deploymentId, authToken, signal } = options
  const reviewId = options.reviewId ?? crypto.randomUUID()
  const assetIds: string[] = []
  const uploadOptions = { hubUrl, projectId, deploymentId, authToken, signal }

  const eventsBlob = new Blob([JSON.stringify(result.events)], { type: 'application/json' })
  assetIds.push(await uploadAsset(uploadOptions, eventsBlob, 'events', 'application/json'))

  if (result.audio) {
    assetIds.push(await uploadAsset(uploadOptions, result.audio.blob, 'audio', result.audio.mimeType))
  }

  const body: Record<string, unknown> = {
    review_id: reviewId,
    subject_id: subjectId,
    project_id: projectId,
    deployment_id: deploymentId,
    started_at: result.startedAt,
    stopped_at: result.stoppedAt,
    duration_ms: result.durationMs,
    asset_ids: assetIds,
    metadata: {
      stroke_count: result.strokes.length,
      event_count: result.events.length,
    },
  }
  if (submittedBy) body.submitted_by = submittedBy

  const res = await fetchReviewHub(buildHubUrl(hubUrl, '/v1/reviews'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
    signal,
  }, 'Review submit')
  if (!res.ok) throw new Error(`Review submit failed: ${res.status}`)
  const data = await res.json() as { review_id: string; status: string }

  return { reviewId: data.review_id, assetIds, status: data.status }
}
