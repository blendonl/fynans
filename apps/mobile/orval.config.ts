import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../backend/openapi.json',
    },
    output: {
      target: './src/api/generated/endpoints',
      schemas: './src/api/generated/model',
      client: 'fetch',
      mode: 'tags-split',
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
