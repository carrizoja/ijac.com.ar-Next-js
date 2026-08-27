/**
 * In-memory stand-in for the KV store, for tests only.
 *
 * Records the TTL applied to every key so retention can be asserted, and can be
 * forced into an outage so fail-closed behavior is exercised against a real
 * rejection rather than a mocked return value.
 */
export class FakeRedis {
  private readonly values = new Map<string, string>();
  private readonly ttls = new Map<string, number>();
  private outage = false;

  /** Every subsequent operation rejects, simulating an unreachable KV store. */
  startOutage(): void {
    this.outage = true;
  }

  stopOutage(): void {
    this.outage = false;
  }

  /** Seeds a counter or flag without going through the outage guard. */
  seed(key: string, value: string): void {
    this.values.set(key, value);
  }

  /** TTL in seconds most recently applied to a key, or undefined if never set. */
  ttlOf(key: string): number | undefined {
    return this.ttls.get(key);
  }

  keys(): string[] {
    return [...this.values.keys()];
  }

  private guard(): void {
    if (this.outage) throw new Error("KV unavailable");
  }

  async incr(key: string): Promise<number> {
    this.guard();
    const next = Number(this.values.get(key) ?? "0") + 1;
    this.values.set(key, String(next));
    return next;
  }

  async expire(key: string, seconds: number): Promise<void> {
    this.guard();
    this.ttls.set(key, seconds);
  }

  async get(key: string): Promise<string | null> {
    this.guard();
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.guard();
    this.values.set(key, value);
    if (ttlSeconds !== undefined) this.ttls.set(key, ttlSeconds);
  }
}
