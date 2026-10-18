import numpy as np
import scipy.io.wavfile as wav
import imageio_ffmpeg
import subprocess
import sys
import os

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

# Preset flag: pass '100' or '75' as argument
# '100' = 100% full background music (volume=0.35)
# '75'  = reduced by 75% (volume=0.088)
mode = sys.argv[1] if len(sys.argv) > 1 else '100'

if mode == '75':
    music_vol = 0.088
    print("Mode: Background music REDUCED by 75% (volume=0.088)")
else:
    music_vol = 0.35
    print("Mode: Background music RESTORED to 100% (volume=0.35)")

# 1. Synthesize clean corporate background music bed (zero echo)
rate = 48000
duration = 52.0
total_samples = int(rate * duration)
t = np.linspace(0, duration, total_samples, endpoint=False)

chords = [
    [146.83, 293.66, 369.99, 440.00, 587.33], # D
    [110.00, 220.00, 277.18, 329.63, 440.00], # A
    [123.47, 246.94, 293.66, 369.99, 493.88], # Bm
    [98.00,  196.00, 246.94, 293.66, 392.00], # G
]

bpm = 112.0
beat_dur = 60.0 / bpm
chord_dur = beat_dur * 4

audio_l = np.zeros(total_samples, dtype=np.float32)
audio_r = np.zeros(total_samples, dtype=np.float32)

num_chords = int(np.ceil(duration / chord_dur))
for c_idx in range(num_chords):
    c_start = int(c_idx * chord_dur * rate)
    c_end = min(total_samples, int((c_idx + 1) * chord_dur * rate))
    if c_start >= total_samples:
        break
    c_t = t[c_start:c_end] - t[c_start]
    c_notes = chords[c_idx % 4]
    
    # Lush pad
    for n_idx, freq in enumerate(c_notes):
        sig = np.sin(2 * np.pi * freq * c_t) * 0.12 + np.sin(4 * np.pi * freq * c_t) * 0.03
        env = np.sin(np.pi * (c_t / (c_t[-1] + 1e-5)))**0.7
        pan = 0.5 + 0.25 * np.sin(n_idx * 1.5)
        audio_l[c_start:c_end] += sig * env * (1 - pan)
        audio_r[c_start:c_end] += sig * env * pan
        
    # Acoustic plucks
    sub_beats = 8
    sub_dur = chord_dur / sub_beats
    for sb in range(sub_beats):
        sb_start = int((c_idx * chord_dur + sb * sub_dur) * rate)
        sb_len = int(sub_dur * rate * 1.5)
        sb_end = min(total_samples, sb_start + sb_len)
        if sb_start >= total_samples:
            break
        sb_t = np.linspace(0, (sb_end - sb_start) / rate, sb_end - sb_start, endpoint=False)
        pluck_freq = c_notes[(sb * 2 + 1) % len(c_notes)] * 2
        pluck_sig = np.sin(2 * np.pi * pluck_freq * sb_t) + 0.3 * np.sin(4 * np.pi * pluck_freq * sb_t)
        decay = np.exp(-sb_t * 9.0)
        p_pan = 0.35 if sb % 2 == 0 else 0.65
        audio_l[sb_start:sb_end] += pluck_sig * decay * 0.06 * (1 - p_pan)
        audio_r[sb_start:sb_end] += pluck_sig * decay * 0.06 * p_pan

peak = max(np.max(np.abs(audio_l)), np.max(np.abs(audio_r)))
audio_l = (audio_l / peak) * 0.8
audio_r = (audio_r / peak) * 0.8

stereo = np.column_stack((audio_l, audio_r))
wav.write('clean_music_synth.wav', rate, (stereo * 32767).astype(np.int16))

# 2. Extract authentic 8s intro with boosted voice
subprocess.run([
    ffmpeg, '-y', '-i', 'public/videos/Real_Estate_Animation_for_CBGIPL.mp4',
    '-t', '8.0',
    '-af', 'volume=2.0,alimiter=limit=0.96:attack=5:release=50',
    '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
    'intro_boosted.wav'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 3. Assemble energetic dialogue stream
parts = [
    'part_d1_powering.mp3',
    'part_d2_oil_gas.mp3',
    'part_d3_fert_chem.mp3',
    'part_d4_metals_min.mp3',
    'part_d5_trading.mp3',
    'part_d6_infra.mp3',
    'part_d7_green_energy.mp3',
    'part_d8_world_opportunities.mp3'
]

cont_wavs = []
for idx, p in enumerate(parts):
    dst = f"dialogue_part_{idx+1}.wav"
    subprocess.run([ffmpeg, '-y', '-i', p, '-ar', '48000', '-ac', '2', dst], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    cont_wavs.append(dst)

# 0.20s silent gap
subprocess.run([
    ffmpeg, '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-t', '0.20', '-c:a', 'pcm_s16le', 'gap_0.20.wav'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

concat_lines = []
for i, f_name in enumerate(cont_wavs):
    concat_lines.append(f"file '{f_name}'")
    if i < len(cont_wavs) - 1:
        concat_lines.append("file 'gap_0.20.wav'")

with open('dialogue_stream.txt', 'w') as f:
    f.write('\n'.join(concat_lines))

subprocess.run([
    ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', 'dialogue_stream.txt',
    '-c:a', 'pcm_s16le', 'dialogue_stream.wav'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 4. Mix speech with chosen background music volume
mix_filter = (
    f"[0:a]volume=4.6,highpass=f=75,lowpass=f=12000,treble=g=2:f=3000,alimiter=limit=0.98:attack=5:release=50[voice];"
    f"[1:a]volume={music_vol},afade=t=in:ss=0:d=1.5,afade=t=out:st=41.5:d=2.5[music];"
    f"[voice][music]amix=inputs=2:duration=first:dropout_transition=2[mixed_continuation]"
)

subprocess.run([
    ffmpeg, '-y',
    '-i', 'dialogue_stream.wav',
    '-i', 'clean_music_synth.wav',
    '-filter_complex', mix_filter,
    '-map', '[mixed_continuation]',
    '-c:a', 'pcm_s16le', 'continuation_mixed.wav'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 5. Join intro + continuation
with open('master_join.txt', 'w') as f:
    f.write("file 'intro_boosted.wav'\nfile 'continuation_mixed.wav'\n")

subprocess.run([
    ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', 'master_join.txt',
    '-af', 'volume=1.8,alimiter=limit=0.96:attack=5:release=50',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    'src/media/hero/hero-narration.m4a'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

res = subprocess.run([ffmpeg, '-i', 'src/media/hero/hero-narration.m4a'], stderr=subprocess.PIPE, text=True)
for l in res.stderr.split('\n'):
    if 'Duration' in l:
        print("Master Audio Duration:", l.strip())

res = subprocess.run([ffmpeg, '-i', 'src/media/hero/hero-narration.m4a', '-af', 'volumedetect', '-f', 'null', '-'], stderr=subprocess.PIPE, text=True)
for l in res.stderr.split('\n'):
    if 'mean_volume' in l or 'max_volume' in l:
        print(l.strip())

# Clean temporary files
for f in cont_wavs + ['clean_music_synth.wav', 'intro_boosted.wav', 'gap_0.20.wav', 'dialogue_stream.txt', 'dialogue_stream.wav', 'continuation_mixed.wav', 'master_join.txt']:
    if os.path.exists(f):
        os.remove(f)

print(f"Master audio successfully built in mode '{mode}'!")

