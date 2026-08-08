import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getSecret(): Buffer {
  const secret = process.env.API_KEYS_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('API_KEYS_SECRET must be set (min 32 chars)')
  }
  return Buffer.from(secret.slice(0, 32), 'utf8')
}

export function encrypt(plaintext: string): string {
  const key = getSecret()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('hex'), encrypted.toString('hex'), tag.toString('hex')].join(':')
}

export function decrypt(blob: string): string {
  const key = getSecret()
  const [ivHex, encHex, tagHex] = blob.split(':')
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(encHex, 'hex')) + decipher.final('utf8')
}

export function keyHint(key: string): string {
  const clean = key.trim()
  if (clean.length <= 4) return '****'
  return '•••' + clean.slice(-4)
}
