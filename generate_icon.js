/**
 * Generate NOVA-Φ ULTRA app icon programmatically
 * Run: node generate_icon.js
 * Outputs: assets/icon.png (512x512)
 */

const { createCanvas } = require('canvas'); // optional dep
const fs = require('fs');

// We'll create icon using pure Node Buffer + raw PNG
// No external deps needed — embed as base64

const ICON_B64 = `
iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF
HmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0w
TXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRh
`.trim();

// Fallback: create a simple colored PNG using raw bytes
function createSimplePNG(size) {
  // PNG signature
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const buf = Buffer.concat([t, data]);
    const crc = crc32(buf);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4); crcBuf.writeInt32BE(crc);
    return Buffer.concat([len, t, data, crcBuf]);
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for(let i=0;i<256;i++){
      let c=i;
      for(let j=0;j<8;j++) c = c&1 ? 0xEDB88320^(c>>>1) : c>>>1;
      table[i]=c;
    }
    for(let i=0;i<buf.length;i++) crc = table[(crc^buf[i])&0xFF]^(crc>>>8);
    return (crc^0xFFFFFFFF)|0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size,0); ihdr.writeUInt32BE(size,4);
  ihdr[8]=8; ihdr[9]=2; // 8bit RGB
  ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

  // Image data: draw icon
  const rows = [];
  const cx=size/2, cy=size/2, r=size*0.45;
  const innerR=size*0.38;

  for(let y=0;y<size;y++){
    const row = [0]; // filter byte
    for(let x=0;x<size;x++){
      const dx=x-cx, dy=y-cy;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const angle=Math.atan2(dy,dx);

      // Background void
      let R=3, G=1, B=10;

      // Outer ring: acid gold
      if(dist>=r-3 && dist<=r+3){
        R=245; G=197; B=24;
      }
      // Inner hex pattern
      else if(dist<innerR){
        // Grid lines
        const gx = Math.abs(((x+4)%16)-8);
        const gy = Math.abs(((y+4)%16)-8);
        if(gx<1||gy<1){
          const alpha=(innerR-dist)/innerR;
          R=Math.round(245*alpha*0.2);
          G=Math.round(197*alpha*0.2);
          B=Math.round(24*alpha*0.2);
        }
      }

      // Central hexagon (Φ symbol area)
      if(dist<size*0.22){
        R=15; G=10; B=30;
      }

      // Φ symbol — vertical bar
      if(Math.abs(dx)<size*0.025 && dist<size*0.2){
        R=245; G=197; B=24;
      }
      // Φ symbol — circle around
      if(Math.abs(dist-size*0.12)<size*0.018 && Math.abs(dx)<size*0.1){
        R=245; G=197; B=24;
      }

      // Corner accent dots
      const corners=[[0.1,0.1],[0.9,0.1],[0.1,0.9],[0.9,0.9]];
      for(const [cx2,cy2] of corners){
        const cdx=(x/size-cx2)*size, cdy=(y/size-cy2)*size;
        if(Math.sqrt(cdx*cdx+cdy*cdy)<size*0.04){
          R=245; G=197; B=24;
        }
      }

      row.push(R,G,B);
    }
    rows.push(Buffer.from(row));
  }

  const raw = Buffer.concat(rows);
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(raw, {level:9});

  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, chunk('IHDR',ihdr), idat, iend]);
}

const sizes = [16,32,48,64,128,256,512];
const outDir = __dirname+'/assets';
require('fs').mkdirSync(outDir, {recursive:true});

// Generate 512px main icon
const png512 = createSimplePNG(512);
fs.writeFileSync(outDir+'/icon.png', png512);
console.log('✅ icon.png (512x512) created');

// Generate 256px for Windows ico placeholder
const png256 = createSimplePNG(256);
fs.writeFileSync(outDir+'/icon-256.png', png256);
console.log('✅ icon-256.png created');

console.log('\nFor production icons, replace assets/icon.png with a proper design.');
console.log('Use electron-icon-builder or iconutil (mac) / ImageMagick (win/linux)');
console.log('to convert to .icns and .ico formats.');
