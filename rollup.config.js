import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
const packageJson = require('./package.json');
import { getFolders } from './scripts/buildUtils';
import generatePackageJson from 'rollup-plugin-generate-package-json';

const plugins = [
  peerDepsExternal(),
  resolve(),
  replace({
    __IS_DEV__: process.env.NODE_ENV === 'development',
    preventAssignment: false
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    useTsconfigDeclarationDir: true
  }),
  terser()
];
const subfolderPlugins = (folderName) => [
  ...plugins,
  generatePackageJson({
    baseContents: {
      name: `${packageJson.name}/${folderName}`,
      private: true,
      main: '../cjs/index.js',
      module: './index.js',
      types: './index.d.ts'
    }
  })
];
const folderBuilds = getFolders('./src/components').map((folder) => {
  console.log(folder);
  return {
    input: `src/components/${folder}/index.ts`,
    output: {
      file: `dist/components/${folder}/index.js`,
      sourcemap: true,
      exports: 'named',
      format: 'esm'
    },
    plugins: subfolderPlugins(folder),
    external: ['react', 'react-dom']
  };
});

export default [
  {
    input: ['src/index.ts'],
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins,
    external: ['react', 'react-dom']
  },
  ...folderBuilds,
  {
    input: ['src/index.ts'],
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins,
    external: ['react', 'react-dom']
  }
];
