// Rebuild the V5 hero montage from the existing real-estate film and
// corporate business profile imagery, synchronized with every spoken keyword,
// enhanced energetic background music, bold tempo, and 200%+ volume.
// Restructured order:
// 1. Intro 3D Animation (CBG IPL — Carter Brown Global Infra Private Limited. Building the Foundations for the Future.)
// 2. Powering Industries & Shaping a Sustainable Tomorrow (Newly generated modern eco-smart city & sustainable energy skyline)
// 3. Oil & Gas
// 4. Fertilizers & Chemicals
// 5. Metals & Minerals
// 6. International Trading & Maritime Cargo Port
// 7. Global Supply Chains (Newly generated intermodal routes: vessel, freight rail, logistics trucks, air cargo)
// 8. Green & Renewable Energy
// 9. Global Network & Opportunities Across The World (Grand Final Ending)
//
// Usage: node scripts/render-hero-profile.cjs [ffmpeg.exe] [output.mp4]
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ffmpeg = process.argv[2] || 'ffmpeg';
const root = path.resolve(__dirname, '..');
const source = (relative) => path.join(root, relative);
const output = path.resolve(process.argv[3] || source('public/videos/hero-bg.mp4'));
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

function caption(label, title, bandOpacity = 0.75) {
  return [
    `drawbox=x=0:y=510:w=1280:h=210:color=0x071426@${bandOpacity}:t=fill`,
    'drawbox=x=608:y=564:w=64:h=4:color=0xD4AF37:t=fill',
    `drawtext=fontfile='${font}':text='${label}':fontcolor=0xD4AF37:fontsize=20:x=(w-text_w)/2:y=590`,
    `drawtext=fontfile='${font}':text='${title}':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=625`,
  ].join(',');
}

function still(input, crop, label, title, name, bandOpacity, duration) {
  const frames = Math.round(duration * 24);
  return `[${input}:v]trim=duration=${duration},setpts=PTS-STARTPTS,${crop}scale=1408:792,` +
    `crop=1280:720:x='(in_w-out_w)*n/${frames}':y='(in_h-out_h)/2',` +
    `setsar=1,format=yuv420p,${caption(label, title, bandOpacity)},fps=24,settb=1/24[${name}]`;
}

// Calibrated Scene Durations synchronized with energetic dialogs:
// d0 (Intro 3D): 8.0s
// d1 (Powering Industries & Shaping Sustainable Tomorrow): 6.5s
// d2 (Oil & Gas): 2.4s
// d3 (Fertilizers & Chemicals): 2.8s
// d4 (Metals & Minerals): 2.6s
// d5 (Imports & Exports): 6.4s
// d6 (Global Supply Chains & Infrastructure): 8.0s
// d7 (Green Energy): 7.9s
// d8 (Grand Final Ending: Global Opportunities Across The World): 8.4s
const d0 = 8.0;
const d1 = 6.5;
const d2 = 2.4;
const d3 = 2.8;
const d4 = 2.6;
const d5 = 6.4;
const d6 = 8.0;
const d7 = 7.9;
const d8 = 8.4;
const trans = 0.35;

const off1 = d0 - trans;               // 7.65
const off2 = off1 + d1 - trans;        // 13.80
const off3 = off2 + d2 - trans;        // 15.85
const off4 = off3 + d3 - trans;        // 18.30
const off5 = off4 + d4 - trans;        // 20.55
const off6 = off5 + d5 - trans;        // 26.60
const off7 = off6 + d6 - trans;        // 34.25
const off8 = off7 + d7 - trans;        // 41.80
const totalDur = off8 + d8;            // 49.85s ~ 52.0s

const filters = [
  // Scene 0: Authentic 3D Architectural intro
  `[0:v]trim=duration=${d0},setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p,` +
    `drawbox=x=395:y=400:w=490:h=42:color=0x071426@0.94:t=fill:enable='gte(t,3.5)',` +
    `drawtext=fontfile='${font}':text='Carter Brown Global Infra Private Limited':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=408:enable='gte(t,3.5)',` +
    'settb=1/24[v0]',
  
  // Scene 1: Powering Industries, Connecting Nations, Shaping a Sustainable Tomorrow (Newly generated)
  still(1, '', 'POWERING INDUSTRIES', 'SHAPING A SUSTAINABLE TOMORROW', 'v1', 0.85, d1),
  
  // Scene 2: Oil & Gas
  still(2, '', 'ENERGY TRADE', 'OIL & GAS', 'v2', 0.75, d2),
  
  // Scene 3: Fertilizers & Chemicals
  still(3, 'crop=648:365:390:0,', 'ESSENTIAL INPUTS', 'FERTILIZERS & CHEMICALS', 'v3', 0.96, d3),
  
  // Scene 4: Metals & Minerals
  still(4, '', 'GLOBAL COMMODITIES', 'METALS & MINERALS', 'v4', 0.75, d4),
  
  // Scene 5: International Trading, Imports & Exports
  still(5, '', 'GLOBAL TRADE', 'IMPORTS & EXPORTS', 'v5', 0.75, d5),
  
  // Scene 6: Global Supply Chains & Infrastructure (Newly generated intermodal transport)
  still(6, '', 'INFRASTRUCTURE & EPC', 'GLOBAL SUPPLY CHAINS', 'v6', 0.85, d6),
  
  // Scene 7: Green Energy & Renewable Energy
  still(7, '', 'SUSTAINABLE FUTURE', 'GREEN & RENEWABLE ENERGY', 'v7', 0.75, d7),
  
  // Scene 8 (Final Scene): Connecting Opportunities Across The World
  still(8, '', 'CROSS-BORDER NETWORK', 'OPPORTUNITIES ACROSS THE WORLD', 'v8', 0.85, d8),

  // Fast energetic crossfade transitions
  `[v0][v1]xfade=transition=fade:duration=${trans}:offset=${off1}[x1]`,
  `[x1][v2]xfade=transition=fade:duration=${trans}:offset=${off2}[x2]`,
  `[x2][v3]xfade=transition=fade:duration=${trans}:offset=${off3}[x3]`,
  `[x3][v4]xfade=transition=fade:duration=${trans}:offset=${off4}[x4]`,
  `[x4][v5]xfade=transition=fade:duration=${trans}:offset=${off5}[x5]`,
  `[x5][v6]xfade=transition=fade:duration=${trans}:offset=${off6}[x6]`,
  `[x6][v7]xfade=transition=fade:duration=${trans}:offset=${off7}[x7]`,
  `[x7][v8]xfade=transition=fade:duration=${trans}:offset=${off8}[video]`,
].join(';');

const args = [
  '-y', '-hide_banner', '-loglevel', 'warning', '-stats',
  '-i', source('public/videos/Real_Estate_Animation_for_CBGIPL.mp4'),
  '-loop', '1', '-framerate', '24', '-t', String(d1), '-i', source('src/media/hero/sustainable-tomorrow.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d2), '-i', source('src/media/hero/energy.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d3), '-i', source('src/media/hero/fertilizers.png'),
  '-loop', '1', '-framerate', '24', '-t', String(d4), '-i', source('src/media/hero/metals.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d5), '-i', source('src/media/hero/global-trade.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d6), '-i', source('src/media/hero/global-supply-chains.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d7), '-i', source('src/media/hero/green-energy.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d8), '-i', source('src/media/hero/global-network.jpg'),
  '-i', source('src/media/hero/hero-narration.m4a'),
  '-filter_complex', filters,
  '-map', '[video]', '-map', '9:a:0',
  '-t', String(totalDur),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
  '-s:v', '960x540', '-pix_fmt', 'yuv420p', '-r', '24',
  '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
  '-movflags', '+faststart', output,
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
