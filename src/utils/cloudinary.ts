import { Image } from 'expo-image';
import type { ExamQuestion } from '@/types/api';

// A handful of fixed width buckets rather than one-off computed values.
// Every tile at "roughly 100px tall" ends up requesting the exact same
// w_200 URL, so Cloudinary only ever transcodes that variant ONCE globally
// (across all users, all devices) instead of once per slightly-different
// height every screen happens to use. That first transcode is the slow
// part - reusing the same URL is what makes every request after it fast.
const WIDTH_BUCKETS = [150, 250, 400, 600, 900];

function bucketWidth(hint: number): number {
  return WIDTH_BUCKETS.find((b) => b >= hint) ?? WIDTH_BUCKETS[WIDTH_BUCKETS.length - 1];
}

/**
 * Injects Cloudinary's f_auto/q_auto/c_limit/w_ delivery transformation.
 * c_limit means it only ever shrinks, never upscales, since our source
 * diagrams are already tiny (~80-180px). Non-Cloudinary URLs pass through
 * untouched, so switching hosts later doesn't break anything here.
 */
export function optimizeUrl(url: string, widthHint: number): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const width = bucketWidth(widthHint);
  const transform = `f_auto,q_auto,c_limit,w_${width}`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

/**
 * Warms expo-image's local disk cache for a batch of URLs. Call this as
 * soon as an exam's questions are fetched (before the user has scrolled to
 * any of them) so that by the time they reach a given question, its image
 * (and Cloudinary's own transcoded/cached copy) is already sitting locally
 * instead of triggering a fresh cold request right when they're looking at
 * the screen waiting for it.
 */
export function prefetchExamImages(questions: ExamQuestion[]) {
  const urls = new Set<string>();

  for (const q of questions) {
    if (q.imageUrl) urls.add(optimizeUrl(q.imageUrl, 600)); // question stem size
    for (const opt of q.options) {
      if (opt.imageUrl) urls.add(optimizeUrl(opt.imageUrl, 250)); // option tile size
    }
  }

  // Fire-and-forget - failures here shouldn't block or alert anything, the
  // normal RemoteImage loading/error states still apply whenever a
  // question actually renders.
  for (const url of urls) {
    Image.prefetch(url).catch(() => {});
  }
}