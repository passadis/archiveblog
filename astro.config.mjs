// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// This is a custom remark plugin to rewrite legacy image paths from the old WordPress site
const LEGACY_IMAGE_HOST = 'https://archive.cloudblogger.eu';

function rewriteLegacyImagePaths() {
  return (tree) => {
    const visit = (node) => {
      if (!node) return;
      if (node.type === 'image' && typeof node.url === 'string' && node.url.startsWith('/wp-content/')) {
        node.url = LEGACY_IMAGE_HOST + node.url;
      }
      if (node.type === 'html' && typeof node.value === 'string' && node.value.includes('/wp-content/')) {
        node.value = node.value.replace(/(["'])\/wp-content\//g, `$1${LEGACY_IMAGE_HOST}/wp-content/`);
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
    remarkPlugins: [rewriteLegacyImagePaths],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      wrap: false,
    },
  },
});
