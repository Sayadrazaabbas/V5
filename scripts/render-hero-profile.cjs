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

function caption(label, title) {
  return [
    'drawbox=x=0:y=510:w=1280:h=210:color=0x071426@0.72:t=fill',
    'drawbox=x=608:y=564:w=64:h=4:color=0xD4AF37:t=fill',
    `drawtext=fontfile='${font}':text='${label}':fontcolor=0xD4AF37:fontsize=20:x=(w-text_w)/2:y=590`,
    `drawtext=fontfile='${font}':text='${title}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=625`,
  ].join(',');
}

function still(input, crop, label, title, name) {
  return `[${input}:v]trim=duration=4,setpts=PTS-STARTPTS,${crop}scale=1408:792,` +
    `crop=1280:720:x='(in_w-out_w)*n/96':y='(in_h-out_h)/2',` +
    `setsar=1,format=yuv420p,${caption(label, title)},fps=24,settb=1/24[${name}]`;
}

const filters = [
  '[0:v]trim=duration=8,setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p,settb=1/24[v0]',
  still(1, '', 'ENERGY TRADE', 'OIL & GAS', 'v1'),
  still(2, 'crop=738:415:300:0,', 'ESSENTIAL INPUTS', 'FERTILIZERS', 'v2'),
  still(3, '', 'GLOBAL COMMODITIES', 'METALS', 'v3'),
  still(4, '', 'CROSS-BORDER NETWORK', 'GLOBAL TRADE', 'v4'),
  '[v0][v1]xfade=transition=fade:duration=0.5:offset=7.5[x1]',
  '[x1][v2]xfade=transition=fade:duration=0.5:offset=11[x2]',
  '[x2][v3]xfade=transition=fade:duration=0.5:offset=14.5[x3]',
  '[x3][v4]xfade=transition=fade:duration=0.5:offset=18[video]',
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
  '-t', '22', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28',
  '-s:v', '960x540', '-pix_fmt', 'yuv420p', '-r', '24',
  '-c:a', 'aac', '-b:a', '96k',
  '-movflags', '+faststart', output,
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
