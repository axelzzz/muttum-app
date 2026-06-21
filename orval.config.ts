import { defineConfig } from 'orval';

export default defineConfig({
  muttum: {
    input: {
      target: 'http://localhost:3000/api-docs.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/app/core/api',
      schemas: 'src/app/core/api/model',
      client: 'angular',
      httpClient: 'fetch',
      baseUrl: 'http://localhost:3000',
      override: {
        header: false,
      },
    },
  },
});
