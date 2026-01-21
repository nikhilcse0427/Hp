import { type Check } from 'checkpoint-client';
export default class TelemetryReporter {
    private product;
    private version;
    private userOptIn;
    private readonly configListener;
    private static TELEMETRY_SECTION_ID;
    private static TELEMETRY_SETTING_ID;
    private static TELEMETRY_OLD_SETTING_ID;
    constructor(product: string, version: string);
    sendTelemetryEvent(event?: Omit<Check.Input, 'product' | 'project_hash' | 'version'>): Promise<void>;
    private updateUserOptIn;
    dispose(): void;
}
