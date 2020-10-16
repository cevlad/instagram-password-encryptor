declare module "blakejs" {
  export interface Context {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [propName: string]: any;
  }

  export function blake2b(
    input: string | Buffer | Uint8Array,
    key?: Uint8Array,
    outlen?: number
  ): Uint8Array;

  export function blake2bHex(
    input: string | Buffer | Uint8Array,
    key?: Uint8Array,
    outlen?: number
  ): string;

  export function blake2bInit(outlen: number, key?: Uint8Array): Context;

  export function blake2bUpdate(ctx: Context, input: Uint8Array): void;

  export function blake2bFinal(ctx: Context): Uint8Array;
}
