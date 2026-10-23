import fs from 'node:fs';
const root='public/sites/odinteatr/fonts';fs.mkdirSync(root,{recursive:true});
for(const [remote,local] of [['Oswald%5Bwght%5D.ttf','oswald.ttf'],['OFL.txt','OFL.txt']]){const r=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/'+remote);if(!r.ok)throw new Error('Font download failed '+r.status);fs.writeFileSync(root+'/'+local,Buffer.from(await r.arrayBuffer()));console.log(local)}
