import crypto, { type BinaryLike } from 'node:crypto';

export default function hashFileContents(contents: BinaryLike) {
  return crypto.createHash('sha1').update(contents).digest('hex');
}
