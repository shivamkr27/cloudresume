// Next's <Image>/<Link> auto-prefix basePath, but plain <a href="/..."> to
// public/ assets (resume, cert PDFs) don't — this fills that gap for the
// GitHub Pages static export, which is served from /cloudresume, not /.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string) {
  return `${BASE_PATH}${path}`;
}
