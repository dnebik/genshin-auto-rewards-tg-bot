import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import * as path from 'path';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    typescript(),
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
      ],
    }),
  ],
};
