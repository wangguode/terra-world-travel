/**
 * 纯 Web Audio API 东方云海氛围声学合成器（零外部音频文件）
 * - 高空微风噪声（随飞行速度动态调制滤波频率）
 * - 穿过灵气光环时的五声音阶古琴/编钟泛音
 */
export class SkySoundEngine {
  private ctx: AudioContext | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private muted = true;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private startWindIfNeeded() {
    const ctx = this.ensureContext();
    if (!ctx || this.windGain) return;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.2;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 340;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.value = this.muted ? 0 : 0.08;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    this.windFilter = filter;
    this.windGain = gain;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!muted) {
      this.startWindIfNeeded();
    }
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(muted ? 0 : 0.08, this.ctx.currentTime, 0.15);
    }
  }

  updateFlightSpeed(speedRatio: number) {
    if (this.muted || !this.ctx || !this.windFilter || !this.windGain) return;
    const t = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1.5, speedRatio));
    this.windFilter.frequency.setTargetAtTime(260 + clamped * 480, t, 0.1);
    this.windGain.gain.setTargetAtTime(0.04 + clamped * 0.09, t, 0.1);
  }

  /** 五声音阶（D 大调宫商角徵羽）古琴泛音 */
  playRingChime(index: number) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const pentatonic = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25];
    const base = pentatonic[index % pentatonic.length];
    const now = ctx.currentTime;

    [base, base * 2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(i === 0 ? 0.18 : 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.85);
    });
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
