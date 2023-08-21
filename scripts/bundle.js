const esbuild = require('esbuild');
const {promises: {copyFile}} = require('fs');
const path = require('path');
const {sassPlugin} = require('esbuild-sass-plugin');
const autoprefixer = require('autoprefixer');
const postcssPresetEnv = require('postcss-preset-env');
const postcss = require('postcss');
const polyfillNode = require("esbuild-plugin-polyfill-node").polyfillNode;

polyfillNode.name = 'node-polyfill';

const {promises: {mkdir, rm}} = require('fs');

const gravitycss = [
'layout/variables.css',
'layout/Row/Row.css',
'layout/Col/Col.css',
'layout/Container/Container.css',
'Card/Card.css',
'variables.css',
'Tabs/Tabs.css',
'controls/mixins.css',
'controls/variables.css',
'controls/TextArea/TextArea.css',
].map(relpath => path.join('node_modules/@gravity-ui/uikit/build/cjs/components', relpath));

(async () => {
    try {
        await rm('build', {recursive: true});
    } catch (e) {
        console.log(e);
    }

    await mkdir('build', {recursive: true});

    await buildCSS();
    await buildTS();
    
    const htmlIn = path.join(process.cwd(), 'src', 'index.html');

    const htmlOut = path.join(process.cwd(), 'build', 'index.html');

    await copyFile(htmlIn, htmlOut);
})();

async function buildTS() {
  return esbuild.build({
        minify: true,
        entryPoints: ['src/index.tsx'],
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        bundle: true,
        outfile: 'build/index.js',
        platform: 'browser',
        logLevel: 'debug',
        plugins: [
            polyfillNode(),
            sassPlugin({
                cssImports: true,
                async transform(source) {
                    const {css} = await postcss([
                        autoprefixer({cascade: false}),
                        postcssPresetEnv({stage: 0}),
                    ]).process(source, {from: undefined});

                    return css;
                },
            }),
        ],
    });

}

async function buildCSS() {
  return esbuild.build({
        entryPoints: [
/*
'@gravity-ui/uikit/styles/fonts.scss',
'@gravity-ui/uikit/styles/styles.css',
'@gravity-ui/uikit/styles/themes/_index.scss',
*/
'src/styles.css',
...gravitycss,
],
        minify: true,
        bundle: true,
        outdir: 'build',
        platform: 'browser',
        logLevel: 'debug',
        plugins: [
            polyfillNode(),
            sassPlugin({
                cssImports: true,

                async transform(source) {
                    const {css} = await postcss([
                        autoprefixer({cascade: false}),
                        postcssPresetEnv({stage: 0}),
                    ]).process(source, {from: undefined});

                    return css;
                },
            }),
        ],
    });
}

