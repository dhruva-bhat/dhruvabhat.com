import { defineConfig } from 'vitest/config'
import path from 'node:path'
export default defineConfig({test:{environment:'node',pool:'threads',maxWorkers:1,fileParallelism:false},resolve:{alias:{'@':path.resolve(__dirname,'./src')}}})
