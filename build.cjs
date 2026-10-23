/* Build a self-contained static ChattoPaper site. */
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readResolved = spec => fs.readFileSync(require.resolve(spec, { paths: [root] }), 'utf8');
const data = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;

const image = data('assets/coast.svg', 'image/svg+xml');
let css = read('src/styles.css');
let html = read('src/index.html');
const scripts = {
  '/*__PDF_LIB__*/': readResolved('pdf-lib/dist/pdf-lib.min.js'),
  '/*__ZIP_LIB__*/': readResolved('pako/dist/pako_inflate.min.js'),
  '/*__IMPORTER__*/': read('src/importer.js'),
  '/*__DOCUMENT__*/': read('src/document.js'),
  '/*__APP__*/': read('src/app.js'),
};
html = html.replace('/*__STYLES__*/', () => css);
for (const [token, body] of Object.entries(scripts)) {
  html = html.replace(token, () => body.replace(/<\/script/gi, '<\\/script'));
}
html = html.replaceAll('__COAST_IMAGE__', image);
if (/\/\*__[A-Z_]+__\*\//.test(html)) throw new Error('Unresolved build marker');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), html);
fs.writeFileSync(path.join(root, 'dist', 'ChattoPaper.html'), html);
console.log(`Built dist/index.html and dist/ChattoPaper.html (${Math.round(Buffer.byteLength(html) / 1024)} KB each).`);