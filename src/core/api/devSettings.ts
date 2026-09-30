export type DevSettings = {
  latencyMs: number;
  forceFailure: boolean;
  isFestivalTheme: boolean;
};

class DevSettingsStore implements DevSettings {
  latencyMs = 0;
  forceFailure = false;
  isFestivalTheme = false;

  reset(): void {
    this.latencyMs = 0;
    this.forceFailure = false;
    this.isFestivalTheme = false;
  }
}

export const devSettings = new DevSettingsStore();
