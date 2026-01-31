// Sound effects for the application
export class SoundManager {
    private static instance: SoundManager;
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    private constructor() {
        // Initialize AudioContext on first user interaction
        if (typeof window !== 'undefined') {
            this.enabled = localStorage.getItem('sound_enabled') !== 'false';
        }
    }

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    toggle(): boolean {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', String(this.enabled));
        return this.enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    // Play bid placed sound (success tone)
    playBidPlaced(): void {
        if (!this.enabled) return;
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    // Play outbid sound (alert tone)
    playOutbid(): void {
        if (!this.enabled) return;
        const ctx = this.getAudioContext();

        // Two tone alert
        [600, 500].forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1 + i * 0.1);

            oscillator.start(ctx.currentTime + i * 0.1);
            oscillator.stop(ctx.currentTime + 0.1 + i * 0.1);
        });
    }

    // Play new bid notification (gentle ping)
    playNewBid(): void {
        if (!this.enabled) return;
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    // Play win celebration sound
    playWin(): void {
        if (!this.enabled) return;
        const ctx = this.getAudioContext();

        // Victory chord
        [523, 659, 784].forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + i * 0.1);

            oscillator.start(ctx.currentTime + i * 0.1);
            oscillator.stop(ctx.currentTime + 0.3 + i * 0.1);
        });
    }

    // Play urgent timer sound (last 10 seconds)
    playUrgent(): void {
        if (!this.enabled) return;
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 900;
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
    }
}
