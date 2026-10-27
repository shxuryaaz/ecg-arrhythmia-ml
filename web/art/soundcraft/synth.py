import numpy as np, wave
sr = 44100
def thump(f0, dur, amp, decay):
    t = np.arange(int(sr*dur))/sr; env = np.exp(-t*decay)
    s = np.sin(2*np.pi*(f0*t - 10*t*t)) * env
    n = np.random.default_rng(0).normal(0, 1, len(t)) * np.exp(-t*60) * 0.15
    return amp*(s + n)
out = np.zeros(int(sr*1.0)); a = thump(58, 0.28, 0.9, 18); out[:len(a)] += a
b = thump(48, 0.20, 0.55, 26); i = int(sr*0.30); out[i:i+len(b)] += b
out = out / np.abs(out).max() * 0.8
w = wave.open('lubdub-raw.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
