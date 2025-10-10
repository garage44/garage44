import type {Task} from '@garage44/bunchy/tasks'

export const tasks: Task[] = [
    {
        cmd: `bun build src/app.ts --outdir=public/js --target=browser --sourcemap=external --minify`,
        cwd: import.meta.dirname,
        id: 'code_frontend',
        kind: 'build',
        name: 'frontend',
    },
]
