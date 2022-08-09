import crypto from 'crypto';

export default function hashFileContents(contents) {
  return crypto.createHash('sha1').update(contents).digest('hex');
}
