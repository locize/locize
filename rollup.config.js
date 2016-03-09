import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';
import { argv } from 'yargs';

const format = argv.format || argv.f || 'iife';
const compress = argv.uglify;

const babelOptions = {
  exclude: 'node_modules/**',
  presets: ['es2015-rollup', 'stage-0'],
  babelrc: false
};

const dest = {
  amd: `dist/amd/locize${compress ? '.min' : ''}.js`,
  umd: `dist/umd/locize${compress ? '.min' : ''}.js`,
  iife: `dist/iife/locize${compress ? '.min' : ''}.js`
}[format];

export default {
  entry: 'src/index.js',
  format,
  plugins: [
    babel(babelOptions),
    npm({ jsnext: true, main: true }),
    commonjs()
  ].concat(compress ? uglify() : []),
  moduleName: 'locize',
  moduleId: 'locize',
  dest
};
