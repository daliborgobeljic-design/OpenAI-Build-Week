/* eslint-disable @typescript-eslint/no-explicit-any */
interface Fetcher { fetch(request: Request): Promise<Response> }
interface D1Database { prepare(query: string): any; batch(statements: any[]): Promise<any[]> }
interface R2Bucket { put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<any>; get(key: string): Promise<any> }
declare module "cloudflare:workers" { export const env: { DB: D1Database; ARTIFACTS: R2Bucket } }
