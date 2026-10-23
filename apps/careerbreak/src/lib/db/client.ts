import os from 'node:os'
import { MongoClient, type Db, type MongoClientOptions } from 'mongodb'

const g = globalThis as unknown as { __careerbreakMongo?: Promise<MongoClient> }

function uri(): string {
  const u = process.env.MONGODB_URI
  if (!u) throw new Error('MONGODB_URI is not set.')
  return u
}

/** Database named in the URI path, or "careerbreak" when the URI has none (common on Atlas). */
export async function db(): Promise<Db> {
  const u = uri()
  // Kept on globalThis so dev hot reloads reuse one connection pool.
  // Hand the driver `os` directly; its default dynamic import('os') fails under Jest and leaves the handshake empty.
  g.__careerbreakMongo ??= new MongoClient(u, { runtimeAdapters: { os } } as MongoClientOptions).connect()
  const name = new URL(u).pathname.replace(/^\//, '') || 'careerbreak'
  return (await g.__careerbreakMongo).db(name)
}

export async function closeDb(): Promise<void> {
  const c = g.__careerbreakMongo
  g.__careerbreakMongo = undefined
  if (c) await (await c).close()
}
