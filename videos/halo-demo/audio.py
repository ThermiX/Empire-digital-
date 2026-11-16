"""Soundtrack for the HALO film: music + sound effects, fully synthesised.
120 BPM (1 beat = 15 frames at 30 fps), 24 s. Every effect is placed on the
frame where its animation happens.   python3 audio.py -> out/audio.wav
"""
import numpy as np
import scipy.signal as sg
import wave, os

SR = 44100
FPS = 30
DUR = 24.0
N = int(SR * (DUR + 3))
rs = np.random.RandomState(4)

music = np.zeros((N, 2))
fx = np.zeros((N, 2))
rev_send = np.zeros((N, 2))


def place(bus, sig, t, gain=1.0, pan=0.0, send=0.0):
    """mix a mono (or stereo) signal into a bus at time t (seconds)"""
    i = int(round(t * SR))
    if i < 0:
        sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0:
        return
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4) * gain
        r = np.sin((pan + 1) * np.pi / 4) * gain
        st = np.stack([sig[:n] * l, sig[:n] * r], axis=1) * 1.414
    else:
        st = sig[:n] * gain
    bus[i:i + n] += st
    if send:
        rev_send[i:i + n] += st * send


def fr(f):
    return f / FPS


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    return sg.sosfilt(sg.butter(order, fc, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, fc, order=2):
    return sg.sosfilt(sg.butter(order, fc, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, f1, f2, order=2):
    return sg.sosfilt(sg.butter(order, [f1, f2], 'band', fs=SR, output='sos'), x, axis=0)


def fade(x, a=0.004, r=0.01):
    x = x.copy()
    na, nr = int(a * SR), int(r * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(freq, dur, detune=0.0, phase=0.0, fmax=9000):
    """band-limited sawtooth (additive)"""
    t = tt(dur)
    f = freq * 2 ** (detune / 1200)
    out = np.zeros_like(t)
    for k in range(1, int(min(48, fmax // f)) + 1):
        out += np.sin(2 * np.pi * f * k * t + phase * k) / k
    return out * 0.6


# ------------------------------------------------------------ sound effects
def sweep_noise(dur, f0, f1, bw=500, peak=0.5, sharp=2.0):
    """band of noise whose centre frequency glides from f0 to f1"""
    t = tt(dur)
    n = lp(rs.randn(len(t)), bw, 2)
    f = f0 * (f1 / f0) ** (t / dur)
    car = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = t / dur
    env = np.where(x < peak, (x / peak) ** sharp, ((1 - x) / (1 - peak)) ** sharp)
    return n * car * env * 3.4


def whoosh(dur=0.5, f0=300, f1=2400, peak=0.55, gain=1.0):
    a = sweep_noise(dur, f0, f1, 600, peak)
    air = hp(rs.randn(len(a)), 5000) * 0.10
    x = np.arange(len(a)) / len(a)
    env = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 2)
    m = (a + air * env) * gain
    pan = np.linspace(-0.6, 0.6, len(m))
    return np.stack([m * np.cos((pan + 1) * np.pi / 4), m * np.sin((pan + 1) * np.pi / 4)], axis=1) * 1.2


def pop(freq=520, gain=1.0):
    t = tt(0.12)
    f = freq * (0.55 + 0.45 * np.exp(-t / 0.018))
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.028), 0.001, 0.02) * gain


def tick(freq=3800, gain=1.0):
    t = tt(0.03)
    return fade((np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.004) + hp(rs.randn(len(t)), 6000) * np.exp(-t / 0.002) * 0.5), 0.0005, 0.01) * gain


def key(gain=1.0):
    t = tt(0.06)
    th = np.sin(2 * np.pi * (170 + rs.rand() * 40) * t) * np.exp(-t / 0.012)
    cl = bp(rs.randn(len(t)), 1800, 5200) * np.exp(-t / 0.004)
    return fade(th * 0.8 + cl * 0.7, 0.0005, 0.01) * gain


def impact(gain=1.0, sub=62, tail=0.45, bright=1.0):
    t = tt(1.4)
    f = sub * (0.5 + 0.5 * np.exp(-t / 0.09))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / tail)
    click = lp(rs.randn(len(t)), 3500) * np.exp(-t / 0.012) * 0.8
    crash = bp(rs.randn(len(t)), 300, 9000) * np.exp(-t / 0.22) * 0.32 * bright
    return fade(np.tanh((s * 1.3 + click + crash) * 1.2), 0.0005, 0.1) * gain


def ding(freq=1318.5, gain=1.0, dur=1.6):
    t = tt(dur)
    out = np.zeros_like(t)
    for r, a, tau in [(1, 1, .55), (2.0, .35, .35), (2.76, .3, .28), (5.4, .14, .16), (8.93, .06, .09)]:
        out += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / tau)
    return fade(out * 0.5, 0.001, 0.1) * gain


def riser(dur, gain=1.0, f0=250, f1=7000):
    t = tt(dur)
    x = t / dur
    n = sweep_noise(dur, f0, f1, 900, 0.97, 2.6)
    f = 180 * (1500 / 180) ** x
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * x ** 3 * 0.25
    return (n + tone) * gain


def glide(dur, f0, f1, gain=1.0, trem=0):
    t = tt(dur)
    x = t / dur
    f = f0 * (f1 / f0) ** x
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    env = np.sin(np.pi * x) ** 0.8
    if trem:
        env = env * (0.7 + 0.3 * np.sin(2 * np.pi * trem * t))
    return fade(s * env, 0.01, 0.03) * gain * 0.4


# ------------------------------------------------------------ instruments
def kick(gain=1.0):
    t = tt(0.42)
    f = 46 + 120 * np.exp(-t / 0.028)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    click = lp(rs.randn(len(t)), 5000) * np.exp(-t / 0.003) * 0.35
    return fade(np.tanh((s + click) * 1.6), 0.0005, 0.03) * gain


def clap(gain=1.0):
    t = tt(0.3)
    n = bp(rs.randn(len(t)), 900, 6500)
    env = np.zeros_like(t)
    for d in (0, 0.011, 0.023):
        env += np.where(t >= d, np.exp(-(t - d) / 0.012), 0) * 0.6
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.09), 0)
    return fade(n * env * 0.5, 0.0005, 0.03) * gain


def hat(gain=1.0, open_=False):
    t = tt(0.3 if open_ else 0.06)
    n = hp(rs.randn(len(t)), 7500, 4)
    return fade(n * np.exp(-t / (0.085 if open_ else 0.014)) * 0.3, 0.0005, 0.01) * gain


def bass_note(m, dur, gain=1.0):
    t = tt(dur)
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.5 * lp(saw(f, dur, fmax=1200), 500)
    env = np.minimum(1, t / 0.008) * np.exp(-t / (dur * 0.9))
    return fade(np.tanh(s * env * 1.3), 0.002, 0.03) * gain


def pluck(m, gain=1.0, dur=0.5):
    t = tt(dur)
    f = mtof(m)
    s = saw(f, dur) + 0.5 * saw(f, dur, 9)
    # filter envelope: bright attack that closes quickly
    a = lp(s, 4200) * np.exp(-t / 0.035) + lp(s, 1300) * np.exp(-t / 0.16) * 0.8
    return fade(a, 0.002, 0.05) * gain * 0.5


def pad_chord(notes, dur, cutoff=1700, gain=1.0):
    out = np.zeros((int(dur * SR), 2))
    for m in notes:
        for det, pan in ((-9, -0.7), (0, 0.0), (8, 0.7)):
            s = saw(mtof(m), dur, det, rs.rand() * 6.28, 6000)
            out[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
            out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    out = lp(out, cutoff, 2)
    t = tt(dur)
    env = np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.12)
    return out * env[:, None] * gain * 0.11


# ------------------------------------------------------------ the song
BEAT = 0.5
BAR = 2.0
CH = {
    'Am': (45, [57, 60, 64, 67]),
    'F': (41, [57, 60, 65, 69]),
    'C': (36, [55, 60, 64, 67]),
    'G': (43, [55, 59, 62, 67]),
}
PROG = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'C']
kicks = []

for bar, name in enumerate(PROG):
    t0 = bar * BAR
    root, notes = CH[name]
    full = 1 <= bar <= 8 and bar != 6
    # --- pad
    if bar == 0:
        p = pad_chord(notes, BAR, 700, 0.9)
        p *= np.linspace(0.25, 1, len(p))[:, None]
    elif bar >= 10:
        p = pad_chord(notes + [74], BAR, 2000 if bar == 10 else 1400, 0.62)
        if bar == 11:
            p *= np.linspace(1, 0, len(p))[:, None] ** 1.5
    elif bar == 6:
        p = pad_chord(notes, BAR, 1100, 0.9)
    elif bar == 9:
        p = pad_chord(notes, BAR, 2400, 0.9)
    else:
        p = pad_chord(notes, BAR, 2700, 0.8)
    place(music, p, t0, 1.0, send=0.25)
    # --- drums
    if full:
        for b in range(4):
            kicks.append(t0 + b * BEAT)
            place(music, kick(), t0 + b * BEAT, 0.86)
            if b in (1, 3):
                place(music, clap(), t0 + b * BEAT, 0.8, send=0.2)
            place(music, hat(), t0 + b * BEAT + 0.25, 0.85, 0.2)
            place(music, hat(), t0 + b * BEAT + 0.125, 0.36, -0.3)
            place(music, hat(), t0 + b * BEAT + 0.375, 0.42, 0.3)
        place(music, hat(open_=True), t0 + 3.5 * BEAT, 0.45, 0.2)
    if bar == 6:      # breakdown under the zoom-out, drums come back at the landing
        for tk in (13.5, 13.75):
            kicks.append(tk); place(music, kick(), tk, 0.9)
        place(music, clap(), 13.75, 0.5, send=0.3)
        for i in range(8):
            place(music, hat(), 13.0 + i * 0.0625, 0.2 + i * 0.05)
    if bar == 9:      # manifesto hits: 18.0 then four stomps
        kicks.append(18.0); place(music, kick(), 18.0, 1.0)
        for tk in (18.25, 18.5, 18.75, 19.0):
            kicks.append(tk); place(music, kick(), tk, 1.0); place(music, clap(), tk, 0.55, send=0.3)
        for i in range(8):   # snare roll into the outro
            place(music, clap(), 19.5 + i * 0.0625, 0.16 + i * 0.045, send=0.2)
    # --- bass (off-beat 8ths, classic pumping feel)
    if full:
        for b in range(4):
            place(music, bass_note(root, 0.22), t0 + b * BEAT + 0.25, 0.54)
            if b % 2:
                place(music, bass_note(root + 12, 0.1), t0 + b * BEAT + 0.375, 0.3)
    elif bar in (0, 6):
        place(music, bass_note(root, 1.9), t0, 0.42 if bar == 0 else 0.5)
    elif bar == 9:
        for tk in (18.0, 18.25, 18.5, 18.75, 19.0):
            place(music, bass_note(root, 0.2), tk, 0.6)
    elif bar == 10:
        place(music, bass_note(root, 3.6), t0, 0.4)
    # --- pluck arpeggio with ping-pong echo
    if 1 <= bar <= 11 and bar != 9:
        tones = notes + [n + 12 for n in notes]
        pat = [0, 4, 2, 5, 3, 6, 2, 5, 1, 4, 2, 5, 3, 7, 5, 4]
        for i, pi in enumerate(pat):
            if bar == 6 and i < 8:
                continue
            if bar == 11 and i > 8:
                continue
            g = 0.72 if full else 0.5
            if bar >= 10:
                g = 0.6 * (1 - (bar - 10) * 0.35 - i * 0.012)
            tn = t0 + i * 0.125
            pl = pluck(tones[pi] + 12, g)
            place(music, pl, tn, 1.0, -0.25, send=0.3)
            place(music, pl, tn + 0.375, 0.34, 0.7, send=0.2)
            place(music, pl, tn + 0.75, 0.15, -0.7, send=0.2)

# side-chain: everything in the music bus ducks under each kick
duck = np.ones(N)
for tk in kicks:
    i = int(tk * SR)
    n = int(0.3 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(n) / (0.085 * SR))
    duck[i:i + n] = np.minimum(duck[i:i + n], seg)
kick_only = np.zeros((N, 2))
for tk in kicks:
    place(kick_only, kick(), tk, 0.86)
music = (music - kick_only) * duck[:, None] + kick_only

# ------------------------------------------------------------ effects on the picture
P = lambda sig, f, g=1.0, pan=0.0, send=0.0: place(fx, sig, fr(f), g, pan, send)

# S1 intro
P(glide(0.7, 500, 1500, 0.5, trem=9), 1, 0.5, send=0.5)                 # ring draws itself
for f, m in [(5, 620), (10, 700), (13, 760), (21, 660), (43, 720)]:
    P(pop(m), f, 0.35, send=0.2)
P(whoosh(0.32, 500, 3200, 0.7), 27, 0.55); P(impact(0.5, 80, 0.2, 0.6), 36.5, 0.7)
P(whoosh(0.32, 600, 3600, 0.7), 32, 0.55); P(impact(0.5, 70, 0.2, 0.6), 41.5, 0.7)
P(riser(0.75, 0.55), 38)                                                # dive through the ring
P(whoosh(0.5, 300, 5000, 0.8), 48, 0.8)
P(impact(1.0, 58, 0.55), 60, 1.0, send=0.5)                             # DROP
# S2 wordmark
for i, m in enumerate([392, 440, 523, 659]):
    P(pop(m), 60 + i * 3.5 + 4, 0.55, -0.4 + i * 0.27, send=0.25)
for f in (79, 82, 89):
    P(tick(), f, 0.25)
P(pop(880), 93, 0.4, send=0.3); P(pop(600), 98, 0.3)
P(riser(0.5, 0.4, 400, 6000), 105); P(whoosh(0.55, 250, 4500, 0.85), 105, 0.85)   # through the O
P(impact(0.9, 60, 0.5), 120, 0.95, send=0.5)
# S3 card
P(whoosh(0.8, 900, 250, 0.4), 115, 0.5)
P(whoosh(0.25, 800, 2600, 0.6), 121, 0.35); P(whoosh(0.25, 800, 2600, 0.6), 130, 0.35)
P(whoosh(0.6, 400, 2200, 0.5), 147, 0.6)                                # card spin
P(whoosh(0.25, 800, 2600, 0.6), 152, 0.3); P(whoosh(0.25, 800, 2600, 0.6), 161, 0.3)
P(pop(700), 166, 0.6); P(ding(1568, 0.7), 167, 0.5, 0.3, send=0.5)      # sticker 0 FCFA
P(whoosh(0.5, 1500, 400, 0.4), 180, 0.45)
P(tick(), 184, 0.25); P(pop(820), 189, 0.4)
for i, f in enumerate((197, 204, 211)):
    P(whoosh(0.2, 600, 2000, 0.7), f - 3, 0.25, 0.5); P(pop(480 + i * 90), f + 4, 0.5, 0.2, send=0.2)
P(whoosh(0.6, 300, 3800, 0.55), 225, 1.0)                               # whip-pan
# S4 phone
for i in range(8):
    P(tick(3200 + i * 150), 245 + i * 2.2, 0.16, -0.3 + i * 0.08)
for i in range(22):                                                     # counter rolling
    P(tick(2600 + rs.rand() * 600), 250 + i * 1.05, 0.10 * (1 - i / 30))
P(pop(784), 257, 0.4, send=0.2)
for i, f in enumerate((258, 264, 270)):
    P(pop(520 + i * 60), f + 3, 0.3, 0.3)
P(whoosh(0.7, 200, 1500, 0.6), 277, 0.55)                               # push-in
P(whoosh(0.3, 500, 1800, 0.6), 283, 0.35)                               # sheet
P(key(1.0), 300, 0.9); P(pop(300), 300, 0.5)                            # tap
P(glide(0.3, 600, 1400, 0.5), 306, 0.4)
for i, m in enumerate((1046.5, 1318.5, 1568)):                          # success chime
    P(ding(m, 0.7), 313 + i * 2.4, 0.5, -0.2 + i * 0.2, send=0.6)
P(pop(880), 323, 0.4, send=0.2)
# S5 zoom-out
P(riser(0.5, 0.35, 300, 3000), 340)
P(whoosh(1.5, 5000, 180, 0.22), 353, 1.0)
P(glide(1.4, 1400, 140, 0.5), 354, 0.5, send=0.4)
for i in range(7):
    P(pop(420 + i * 55), 383 + i * 2.2, 0.3, -0.5 + i * 0.16)
P(impact(0.7, 66, 0.35, 0.7), 399, 0.7, send=0.4)
P(whoosh(0.35, 500, 2200, 0.6), 398, 0.35)
# S6 bento
P(whoosh(0.4, 300, 3000, 0.6), 414, 0.75)
tt_ = 420.0
for i in range(14):                                                     # slot machine ratchet
    P(tick(1800 + i * 40), tt_, 0.3); tt_ += 0.55 + i * 0.09
P(impact(0.6, 75, 0.25, 0.5), 431, 0.75); P(ding(1175, 0.6), 432, 0.4, send=0.5)
P(pop(700), 436, 0.35); P(pop(560), 440, 0.3)
P(whoosh(0.45, 300, 4200, 0.5), 444, 0.9)
P(glide(0.4, 500, 2600, 0.5), 450, 0.45); P(pop(660), 452, 0.5); P(pop(900), 460, 0.4, send=0.2)
P(whoosh(0.45, 300, 4200, 0.5), 474, 0.9)
P(glide(0.7, 300, 1100, 0.5, trem=14), 484, 0.5, send=0.3)
for i in range(18):
    P(tick(2400 + i * 90), 485 + i * 1.1, 0.10)
P(ding(1568, 0.6), 505, 0.45, send=0.5)
P(whoosh(0.8, 3500, 250, 0.3), 504, 0.8)
P(pop(520), 514, 0.6, send=0.3)
# S7 manifesto
P(whoosh(0.45, 300, 3500, 0.7), 531, 0.8)
for i, f in enumerate((547.5, 555, 562.5, 570)):
    P(whoosh(0.2, 2500, 300, 0.8), f - 6, 0.45)
    P(impact(0.9, 70 - i * 3, 0.3, 0.9), f, 0.95, send=0.35)
P(riser(0.55, 0.45, 300, 5000), 584)
P(whoosh(0.55, 4000, 300, 0.75), 586, 0.7)
# S8 outro
P(impact(1.0, 55, 0.7), 600.5, 1.0, send=0.7)
P(ding(784, 0.7, 2.4), 601, 0.45, send=0.7)
for i, m in enumerate((523, 440, 392)):
    P(pop(m), 603 + i * 3 + 6, 0.5, 0.3 - i * 0.3, send=0.3)
for f in (622, 627):
    P(tick(), f, 0.25)
P(pop(880), 631, 0.4, send=0.3)
P(whoosh(0.3, 400, 1800, 0.6), 638, 0.35); P(pop(500), 643, 0.35)
for i in range(12):
    P(key(), 650 + (i + 1) * 2.2, 0.55, -0.25 + i * 0.045)
P(pop(700), 679, 0.5); P(ding(1568, 0.7, 2.2), 680, 0.5, 0.2, send=0.7)

# ------------------------------------------------------------ reverb + master
ir_t = tt(2.2)
ir = np.stack([rs.randn(len(ir_t)), rs.randn(len(ir_t))], axis=1) * np.exp(-ir_t / 0.5)[:, None]
ir = lp(hp(ir, 250), 6500)
ir /= np.sqrt((ir ** 2).sum(axis=0)).max()
wet = np.stack([sg.fftconvolve(rev_send[:, c], ir[:, c])[:N] for c in (0, 1)], axis=1)

def pk(x):
    return np.percentile(np.abs(x), 99.95)


print('bus levels (99.95%%):  music %.2f   fx %.2f   reverb %.2f' % (pk(music), pk(fx), pk(wet)))
mix = music * 0.80 + fx * 0.58 + wet * 0.30
mix = hp(mix, 28)
mix = mix + hp(mix, 3200, 1) * 0.55            # high shelf: a little air
mix = mix[:int(DUR * SR)]
n_out = int(0.5 * SR)
mix[-n_out:] *= np.linspace(1, 0, n_out)[:, None] ** 1.5
mix = mix / pk(mix) * 0.80                  # loud peaks sit just below the knee
mix = np.tanh(mix * 1.15) / np.tanh(1.15)   # soft limiter: only the top few dB are rounded
mix = np.clip(mix, -1, 1) * 0.94

os.makedirs('out', exist_ok=True)
with wave.open('out/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
rms = lambda a: 20 * np.log10(np.sqrt((a ** 2).mean()) + 1e-9)
print('audio written:', len(mix) / SR, 's  peak', np.abs(mix).max().round(3), ' rms %.1f dB' % rms(mix))
bands = [(20, 100), (100, 400), (400, 2000), (2000, 8000), (8000, 20000)]
seg = mix[int(4 * SR):int(8 * SR)].mean(axis=1)
print('  spectrum 4-8s:', '  '.join('%d-%dHz %.1f dB' % (a, b, rms(bp(seg, a, b, 4))) for a, b in bands))
for s in range(0, 24, 2):
    print('  %2d-%2ds  rms %.1f dB' % (s, s + 2, rms(mix[s * SR:(s + 2) * SR])))
