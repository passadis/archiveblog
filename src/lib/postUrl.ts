import { pad2 } from './date';

export interface PostLike {
  data: { date: Date; slug: string };
}

export function postUrl(post: PostLike): string {
  const d = post.data.date;
  return `/${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${post.data.slug}/`;
}

export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
