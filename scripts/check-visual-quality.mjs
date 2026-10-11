import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../dist/datasheet.css',import.meta.url),'utf8');
const palette=Object.fromEntries([...css.matchAll(/--([a-z-]+):#([0-9a-f]{6})(?![0-9a-f])/gi)].map(m=>[m[1],m[2]]));
const luminance=hex=>[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const pairs=[['ink','paper'],['ink-muted','paper'],['ink-muted','panel'],['accent','paper'],['warn','paper'],['warn','panel'],['warn','code'],['danger','paper'],['on-accent','accent']];
for(const [fg,bg] of pairs){const [a,b]=[luminance(palette[fg]),luminance(palette[bg])].sort((a,b)=>a-b),ratio=(b+.05)/(a+.05);assert.ok(ratio>=4.5,`${fg}/${bg}: ${ratio.toFixed(2)} must reach 4.5`);console.log(`${fg}/${bg}: ${ratio.toFixed(2)}`);}
const editorial=fs.readFileSync(new URL('../dist/editorial.css',import.meta.url),'utf8');
assert.doesNotMatch(editorial,/#(?:[0-9a-f]{3}){1,2}\b/i,'new components must use shared color tokens');
for(const name of ['Regular','SemiBold']){const bytes=fs.readFileSync(new URL(`../dist/fonts/IBMPlexMono-${name}.woff2`,import.meta.url));assert.equal(bytes.subarray(0,4).toString(),'wOF2');}
assert.doesNotMatch(fs.readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8'),/fonts\.googleapis/,'core typography must not wait for external font CSS');
console.log('PASS visual tokens: text contrast, shared colors, valid locally served fonts and no remote font import.');
