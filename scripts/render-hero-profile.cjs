// Rebuild the V5 hero montage from the existing real-estate film and
// illustrative images supplied in the corporate business profile, synchronized
// with the upbeat corporate business profile narration and charming audio tune.
// Usage: node scripts/render-hero-profile.cjs [ffmpeg.exe] [output.mp4]
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ffmpeg = process.argv[2] || 'ffmpeg';
const root = path.resolve(__dirname, '..');
const source = (relative) => path.join(root, relative);
const output = path.resolve(process.argv[3] || source('public/videos/hero-bg.mp4'));
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

function caption(label, title, bandOpacity = 0.72) {
  return [
    `drawbox=x=0:y=510:w=1280:h=210:color=0x071426@${bandOpacity}:t=fill`,
    'drawbox=x=608:y=564:w=64:h=4:color=0xD4AF37:t=fill',
    `drawtext=fontfile='${font}':text='${label}':fontcolor=0xD4AF37:fontsize=20:x=(w-text_w)/2:y=590`,
    `drawtext=fontfile='${font}':text='${title}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=625`,
  ].join(',');
}

function still(input, crop, label, title, name, bandOpacity, duration) {
  const frames = Math.round(duration * 24);
  return `[${input}:v]trim=duration=${duration},setpts=PTS-STARTPTS,${crop}scale=1408:792,` +
    `crop=1280:720:x='(in_w-out_w)*n/${frames}':y='(in_h-out_h)/2',` +
    `setsar=1,format=yuv420p,${caption(label, title, bandOpacity)},fps=24,settb=1/24[${name}]`;
}

// Snappy, charming slide durations:
const d0 = 7.5;
const d1 = 9.3;
const d2 = 9.2;
const d3 = 9.5;
const d4 = 8.6;
const d5 = 15.6;
const trans = 0.5;

const off1 = d0 - trans;               // 7.0
const off2 = off1 + d1 - trans;        // 15.8
const off3 = off2 + d2 - trans;        // 24.5
const off4 = off3 + d3 - trans;        // 33.5
const off5 = off4 + d4 - trans;        // 41.6
const totalDur = off5 + d5;            // 57.2

const filters = [
  `[0:v]trim=duration=${d0},setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p,` +
    `drawbox=x=395:y=400:w=490:h=42:color=0x071426@0.94:t=fill:enable='gte(t,3.5)',` +
    `drawtext=fontfile='${font}':text='Carter Brown Global Infra Private Limited':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=408:enable='gte(t,3.5)',` +
    'settb=1/24[v0]',
  still(1, '', 'ENERGY TRADE', 'OIL & GAS', 'v1', 0.72, d1),
  still(2, 'crop=648:365:390:0,', 'ESSENTIAL INPUTS', 'FERTILIZERS', 'v2', 0.96, d2),
  still(3, '', 'GLOBAL COMMODITIES', 'METALS & GREEN ENERGY', 'v3', 0.72, d3),
  still(4, '', 'CROSS-BORDER NETWORK', 'GLOBAL TRADE', 'v4', 0.72, d4),
  `[0:v]trim=start=0:duration=${d5},setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p,` +
    `drawbox=x=0:y=500:w=1280:h=220:color=0x071426@0.85:t=fill,` +
    `drawbox=x=590:y=540:w=100:h=4:color=0xD4AF37:t=fill,` +
    `drawtext=fontfile='${font}':text='CBG IPL':fontcolor=0xD4AF37:fontsize=24:x=(w-text_w)/2:y=555,` +
    `drawtext=fontfile='${font}':text='Carter Brown Global Infra Private Limited':fontcolor=white:fontsize=32:x=(w-text_w)/2:y=590,` +
    `drawtext=fontfile='${font}':text='Building Today. Powering Tomorrow.':fontcolor=0xD4AF37:fontsize=20:x=(w-text_w)/2:y=640,` +
    'settb=1/24[v5]',
  `[v0][v1]xfade=transition=fade:duration=${trans}:offset=${off1}[x1]`,
  `[x1][v2]xfade=transition=fade:duration=${trans}:offset=${off2}[x2]`,
  `[x2][v3]xfade=transition=fade:duration=${trans}:offset=${off3}[x3]`,
  `[x3][v4]xfade=transition=fade:duration=${trans}:offset=${off4}[x4]`,
  `[x4][v5]xfade=transition=fade:duration=${trans}:offset=${off5}[video]`,
].join(';');

const args = [
  '-y', '-hide_banner', '-loglevel', 'warning', '-stats',
  '-stream_loop', '3', '-i', source('public/videos/Real_Estate_Animation_for_CBGIPL.mp4'),
  '-loop', '1', '-framerate', '24', '-t', String(d1), '-i', source('src/media/hero/energy.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d2), '-i', source('src/media/hero/fertilizers.png'),
  '-loop', '1', '-framerate', '24', '-t', String(d3), '-i', source('src/media/hero/metals.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d4), '-i', source('src/media/hero/global-trade.jpg'),
  '-i', source('src/media/hero/hero-narration.m4a'),
  '-filter_complex', filters,
  '-map', '[video]', '-map', '5:a:0',
  '-t', String(totalDur),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '24',
  '-s:v', '960x540', '-pix_fmt', 'yuv420p', '-r', '24',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart', output,
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
