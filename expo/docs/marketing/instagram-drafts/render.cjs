const fs=require('node:fs');
const path=require('node:path');
const sharp=require(process.env.SHARP_MODULE_PATH||'sharp');
(async()=>{const names=['01-meet-tranquil-fast','02-your-routine','03-your-choice'];for(const n of names){await sharp(path.join(__dirname,n+'.svg')).flatten({background:'#ffffff'}).png().toFile(path.join(__dirname,n+'.png'));}const tiles=[];for(let i=0;i<names.length;i++)tiles.push({input:await sharp(path.join(__dirname,names[i]+'.png')).resize(360,450).png().toBuffer(),left:24+i*384,top:24});await sharp({create:{width:1176,height:498,channels:3,background:'#e9e5ef'}}).composite(tiles).png().toFile(path.join(__dirname,'preview.png'));console.log('Rendered 3 opaque 1080 x 1350 PNGs and preview.');})();
