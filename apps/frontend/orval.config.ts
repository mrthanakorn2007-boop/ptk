import { defineConfig } from 'orval'

export default defineConfig({
    api: {
        input: {
            target: 'http://localhost:4001/doc',
        },
        output: {
            mode: 'tags-split',
            target: 'src/lib/api/generated/api.ts',
            schemas: 'src/lib/api/generated/model',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/lib/api/axios-instance.ts',
                    name: 'customInstance',
                },
            },
        },
    },
})
