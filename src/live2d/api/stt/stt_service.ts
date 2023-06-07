export interface ISTTService {
  setParams(params: Params): void;
  // 开始
  start(): void;
  // stop
  stop(): void;
}

export interface Params {
  apiKey: string;
}

export class RuntimeError extends Error {}
export enum Status {
  INIT,
  ING,
  END,
}
