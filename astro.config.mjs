// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// Map legacy WordPress upload paths to the blob storage where the images now live.
// Source path:  /wp-content/uploads/2024/12/foo.jpg
// Target URL:   https://storagecblog.blob.core.windows.net/cb-seo/images/tmp/2024/12/foo.jpg
const BLOB_IMAGE_BASE = 'https://storagecblog.blob.core.windows.net/cb-seo/images/tmp';
const UPLOADS_PREFIX = '/wp-content/uploads';

function rewriteUploadsToBlob() {
  return (tree) => {
    const visit = (node) => {
      if (!node) return;
      if (node.type === 'image' && typeof node.url === 'string' && node.url.startsWith(UPLOADS_PREFIX)) {
        node.url = BLOB_IMAGE_BASE + node.url.slice(UPLOADS_PREFIX.length);
      }
      if (node.type === 'html' && typeof node.value === 'string' && node.value.includes(UPLOADS_PREFIX)) {
        node.value = node.value.replace(
          /(["'])\/wp-content\/uploads\//g,
          `$1${BLOB_IMAGE_BASE}/`
        );
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://archive.cloudblogger.eu',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()],

  markdown: {
    remarkPlugins: [rewriteUploadsToBlob],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      wrap: false,
    },
  },
});
