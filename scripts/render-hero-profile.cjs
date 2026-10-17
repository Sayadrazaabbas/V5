// Rebuild the V5 hero montage from the existing real-estate film and
// illustrative images supplied in the corporate business profile.
// Usage: node scripts/render-hero-profile.cjs <ffmpeg.exe> [output.mp4]
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ffmpeg = process.argv[2] || 'ffmpeg';
const root = path.resolve(__dirname, '..');
const source = (relative) => path.join(root, relative);
const output = path.resolve(process.argv[3] || source('public/videos/hero-bg.mp4'));
const font = 'C\\:/Windows/Fonts/arialbd.ttf';
const originalDuration = 8;

function caption(label, title, bandOpacity = 0.72) {
  return [
    `drawbox=x=0:y=510:w=1280:h=210:color=0x071426@${bandOpacity}:t=fill`,
    'drawbox=x=608:y=564:w=64:h=4:color=0xD4AF37:t=fill',
    `drawtext=fontfile='${font}':text='${label}':fontcolor=0xD4AF37:fontsize=20:x=(w-text_w)/2:y=590`,
    `drawtext=fontfile='${font}':text='${title}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=625`,
  ].join(',');
}

function still(input, crop, label, title, name, bandOpacity) {
  return `[${input}:v]trim=duration=4,setpts=PTS-STARTPTS,${crop}scale=1408:792,` +
    `crop=1280:720:x='(in_w-out_w)*n/96':y='(in_h-out_h)/2',` +
    `setsar=1,format=yuv420p,${caption(label, title, bandOpacity)},fps=24,settb=1/24[${name}]`;
}

const filters = [
  // Preserve all 8 seconds. Cover only the artifacted subtitle on the
  // original end card, then typeset the verified company name cleanly.
  `[0:v]trim=duration=${originalDuration},setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p,` +
    `drawbox=x=395:y=400:w=490:h=42:color=0x071426@0.94:t=fill:enable='gte(t,4.5)',` +
    `drawtext=fontfile='${font}':text='Carter Brown Global Infra Private Limited':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=408:enable='gte(t,4.5)',` +
    'settb=1/24[v0]',
  still(1, '', 'ENERGY TRADE', 'OIL & GAS', 'v1'),
  // Crop out the slide's left text panel completely; a partial word was visible.
  still(2, 'crop=648:365:390:0,', 'ESSENTIAL INPUTS', 'FERTILIZERS', 'v2', 0.96),
  still(3, '', 'GLOBAL COMMODITIES', 'METALS', 'v3'),
  still(4, '', 'CROSS-BORDER NETWORK', 'GLOBAL TRADE', 'v4'),
  '[v1][v2]xfade=transition=fade:duration=0.5:offset=3.5[x1]',
  '[x1][v3]xfade=transition=fade:duration=0.5:offset=7[x2]',
  '[x2][v4]xfade=transition=fade:duration=0.5:offset=10.5[profile]',
  '[v0][profile]concat=n=2:v=1:a=0[video]',
].join(';');

const args = [
  '-y', '-hide_banner', '-loglevel', 'warning', '-stats',
  '-stream_loop', '2', '-i', source('public/videos/Real_Estate_Animation_for_CBGIPL.mp4'),
  '-loop', '1', '-framerate', '24', '-t', '4', '-i', source('src/media/hero/energy.jpg'),
  '-loop', '1', '-framerate', '24', '-t', '4', '-i', source('src/media/hero/fertilizers.png'),
  '-loop', '1', '-framerate', '24', '-t', '4', '-i', source('src/media/hero/metals.jpg'),
  '-loop', '1', '-framerate', '24', '-t', '4', '-i', source('src/media/hero/global-trade.jpg'),
  '-filter_complex', filters,
  '-map', '[video]', '-map', '0:a:0',
  '-t', '22.5', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28',
  '-s:v', '960x540', '-pix_fmt', 'yuv420p', '-r', '24',
  '-c:a', 'aac', '-b:a', '96k',
  '-movflags', '+faststart', output,
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
