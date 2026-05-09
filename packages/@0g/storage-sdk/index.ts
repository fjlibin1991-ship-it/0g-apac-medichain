/** 0G Storage SDK stub — real SDK at https://docs.0g.ai/storage */
export interface StorageEntry { value: string }
export interface StorageClient {
  set(opts: { key: string; value: string }): Promise<void>;
  get(key: string): Promise<StorageEntry | null>;
  keys(prefix: string, limit?: number): Promise<string[]>;
  append(key: string, value: string): Promise<void>;
  readLog(key: string, limit?: number): Promise<string[]>;
}
export function StorageClient(_rpc: string, _contract: string): StorageClient {
  const noop = async () => {};
  return {
    set: noop as any, get: async () => null,
    keys: async () => [], append: noop as any, readLog: async () => [],
  };
}
