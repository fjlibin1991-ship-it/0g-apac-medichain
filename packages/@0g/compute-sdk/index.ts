/** 0G Compute SDK stub — real SDK at https://docs.0g.ai/compute */
export interface InferenceResult { choices?: Array<{ text: string }>; text?: string }
export class ComputeClient {
  constructor(private _rpc: string) {}
  async inference(_opts: { model: string; prompt: string; max_tokens?: number }): Promise<InferenceResult> {
    return { choices: [{ text: '{"text":"Demo","citations":[],"confidence":0.5}' }] };
  }
}
