/* TinaCMS config — Cool Bird Counseling
   Setup: npx @tinacms/cli@latest init  →  add TINA_CLIENT_ID / TINA_TOKEN,
   then `npx tinacms dev -c "node build.js"`. Editing at /admin writes markdown
   into content/posts/, and build.js regenerates blog.html + each post page. */
import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: process.env.HEAD || 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: '.' },
  media: { tina: { mediaRoot: 'assets/blog', publicFolder: '.' } },
  schema: {
    collections: [{
      name: 'post',
      label: 'Blog Posts',
      path: 'content/posts',
      format: 'md',
      ui: { router: ({ document }) => `/blog-${document._sys.filename}.html` },
      fields: [
        { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
        { type: 'string', name: 'slug', label: 'URL slug', required: true },
        { type: 'datetime', name: 'date', label: 'Date', required: true },
        { type: 'string', name: 'description', label: 'Meta description', ui: { component: 'textarea' } },
        { type: 'string', name: 'tags', label: 'Tags', list: true },
        { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
      ],
    }],
  },
});
