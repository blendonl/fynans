export type ProgressReporter = (percent: number) => void | Promise<void>;

interface Stage {
  name: string;
  weight: number;
}

/**
 * Tracks progress across weighted pipeline stages.
 * Each stage occupies a proportional slice of 0–100 based on its weight.
 * Within a stage, sub-progress (e.g. token streaming) smoothly fills that slice.
 */
export class ProgressTracker {
  private readonly stages: Stage[];
  private readonly totalWeight: number;
  private currentStageIndex = -1;
  private lastReported = 0;

  constructor(
    stages: Stage[],
    private readonly reporter: ProgressReporter,
  ) {
    this.stages = stages;
    this.totalWeight = stages.reduce((sum, s) => sum + s.weight, 0);
  }

  /** Mark a stage as started (reports the start of that stage's range). */
  startStage(name: string): void {
    const idx = this.stages.findIndex((s) => s.name === name);
    if (idx === -1) return;
    this.currentStageIndex = idx;
    this.report(this.stageStart(idx));
  }

  /** Mark a stage as complete (reports the end of that stage's range). */
  completeStage(name: string): void {
    const idx = this.stages.findIndex((s) => s.name === name);
    if (idx === -1) return;
    this.report(this.stageEnd(idx));
  }

  /**
   * Report sub-progress within a specific stage.
   * @param stageIndex the stage index
   * @param fraction 0–1 indicating how far through the stage we are
   */
  private stageProgress(stageIndex: number, fraction: number): void {
    const clamped = Math.min(Math.max(fraction, 0), 1);
    const start = this.stageStart(stageIndex);
    const end = this.stageEnd(stageIndex);
    this.report(start + (end - start) * clamped);
  }

  /**
   * Create an `onToken` callback for Ollama streaming within a named stage.
   * Progress asymptotically approaches the end of the stage's range as
   * tokens are generated relative to the expected count.
   */
  tokenCallback(
    stageName: string,
    expectedTokens: number,
  ): ((tokensSoFar: number) => void) | undefined {
    const idx = this.stages.findIndex((s) => s.name === stageName);
    if (idx === -1) return undefined;

    return (tokensSoFar: number) => {
      const fraction = 1 - Math.exp((-1.5 * tokensSoFar) / expectedTokens);
      this.stageProgress(idx, Math.min(fraction, 0.95));
    };
  }

  complete(): void {
    this.report(100);
  }

  private stageStart(idx: number): number {
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      offset += this.stages[i].weight;
    }
    return (offset / this.totalWeight) * 100;
  }

  private stageEnd(idx: number): number {
    return this.stageStart(idx) + (this.stages[idx].weight / this.totalWeight) * 100;
  }

  private report(percent: number): void {
    const rounded = Math.round(percent);
    if (rounded > this.lastReported) {
      this.lastReported = rounded;
      this.reporter(rounded);
    }
  }
}
