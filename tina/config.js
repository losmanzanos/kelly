/* TinaCMS config — Cool Bird Counseling
 *
 * Local:  npm install && npx tinacms dev -c "node build.js"   (reads .env)
 * Deploy: Cloudflare build command `npm run build:cms`, with TINA_CLIENT_ID
 *         and TINA_TOKEN set as Pages variables.
 *
 * Kelly edits at /admin. Tina commits markdown to content/posts/, the push
 * triggers a Pages build, and build.js regenerates blog.html plus each post
 * page from that markdown.
 */
import { defineConfig } from 'tinacms';

/* The banner photos build.js knows how to render. Kept as a select rather than
   a free-text field so a typo can't silently produce a bannerless post. */
const HEROES = [
  { value: 'trail',  label: 'Mountain trail (green valley)' },
  { value: 'aspen',  label: 'Aspens in autumn gold' },
  { value: 'pines',  label: 'Pine forest' },
  { value: 'peaks',  label: 'Snowy peaks' },
  { value: 'basin',  label: 'Wide valley basin' },
  { value: 'valley', label: 'Deep valley' },
];

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
      ui: {
        /* Explicit so New / Delete are always offered in the sidebar. */
        allowedActions: { create: true, delete: true },
        /* The filename IS the URL: content/posts/foo.md -> /blog-foo.
           There is deliberately no separate slug field — two sources of truth
           for one URL is how you end up with a post whose page never builds. */
        filename: {
          readonly: false,
          slugify: (values) =>
            (values?.title || 'untitled')
              .toLowerCase()
              .replace(/['’]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 60),
        },
        router: ({ document }) => `/blog-${document._sys.filename}`,
        /* New posts start as drafts and dated today. */
        defaultItem: () => ({
          date: new Date().toISOString().slice(0, 10),
          published: false,
          hero: 'trail',
        }),
      },
      fields: [
        {
          type: 'string', name: 'title', label: 'Title',
          isTitle: true, required: true,
        },
        {
          type: 'boolean', name: 'published', label: 'Published',
          description:
            'Off keeps the post out of the blog index, the sitemap and search ' +
            'results, and removes its page from the site on the next build. ' +
            'Turn it back on to republish.',
        },
        {
          type: 'datetime', name: 'date', label: 'Date',
          required: true, ui: { dateFormat: 'YYYY-MM-DD' },
        },
        {
          type: 'string', name: 'description', label: 'Meta description',
          description:
            'Shown in Google results and link previews. Aim for 140–160 ' +
            'characters — longer gets cut off mid-sentence.',
          ui: { component: 'textarea' },
        },
        {
          type: 'string', name: 'hero', label: 'Header photo',
          options: HEROES,
        },
        {
          type: 'string', name: 'heroAlt', label: 'Header photo description',
          description: 'For screen readers. Describe the photo in a few words.',
        },
        { type: 'string', name: 'tags', label: 'Tags', list: true },
        { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
      ],
    }],
  },
});
