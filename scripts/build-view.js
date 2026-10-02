'use strict';

// Development separates shared CSS and view modules; distribution embeds both.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sharedCss = fs.readFileSync(path.join(root, 'styles/view.css'), 'utf8');
// Preserve the canonical CSS verbatim while keeping the JS literal safe to embed.
const serializedCss = JSON.stringify(sharedCss)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
fs.writeFileSync(path.join(root, 'styles/view-source.js'),
  '// Auto-generated from styles/view.css by scripts/build-view.js. Do not hand edit.\n' +
  'window.HandbookSharedCss = ' + serializedCss + ';\n');
const html = fs.readFileSync(path.join(root, 'view.html'), 'utf8');
const withSharedStyles = html.replace(/<link rel="stylesheet" href="([^"]+)" data-shared-styles\s*\/?>/g, function(_, source) {
  const css = fs.readFileSync(path.join(root, source), 'utf8').replace(/<\/style/gi, '\\3c /style');
  return '<style data-shared-styles>' + css + '\n</style>';
});
const withoutStyleSource = withSharedStyles.replace(/<script\b[^>]*\bdata-shared-style-source\b[^>]*>[\s\S]*?<\/script>\s*/g, '');
const bundled = withoutStyleSource.replace(/<script data-view-module="([^"]+)" src="([^"]+)"><\/script>/g, function(_, name, source) {
  const code = fs.readFileSync(path.join(root, source), 'utf8').replace(/<\/script/gi, '<\\/script');
  return '<script data-view-module="' + name + '">\n' + code + '\n</script>';
});
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'view.html'), bundled);
// Keep the existing input/view round trip working in the distribution folder.
fs.copyFileSync(path.join(root, 'input.html'), path.join(output, 'input.html'));
console.log('Built dist/view.html (standalone) and dist/input.html');