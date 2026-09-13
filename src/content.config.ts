import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['code', 'design', 'writing']),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    links: z
      .object({
        demo: z.string().url().optional(),
        repo: z.string().url().optional(),
        article: z.string().url().optional(),
      })
      .optional(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    date: z.coerce.date().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
