"""Extract a small acoustic rock kit from DRSKit 2.1 (DrumGizmo, CC-BY 4.0).

The kit zip is 2.8 GB, so this reads only the files it needs with HTTP range
requests, mixes each hit's 13 mic channels down to mono, trims and fades it,
and writes 16-bit 44.1 kHz WAVs to public/audio/drums/. See docs/licences.md.

Run: python3 scripts/audio/fetch-drums.py
"""

import array
import io
import http.client
import os
import struct
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

URL = "https://drumgizmo.org/kits/DRSKit/DRSKit2_1.zip"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "audio", "drums")
OUT_RATE = 44100

# (output name, instrument folder, loudness rank 0..1, seconds, mic weights)
HITS = [
    ("kick", "Kdrum_with_contact", 0.85, 0.6,
     {"Kdrum_back": 1.0, "Kdrum_front": 0.5, "OHL": 0.2, "OHR": 0.2, "AmbL": 0.25, "AmbR": 0.25}),
    ("snare", "Snare", 0.85, 0.7,
     {"Snare_top": 1.0, "Snare_bottom": 0.35, "OHL": 0.45, "OHR": 0.45, "AmbL": 0.35, "AmbR": 0.35}),
    ("hihat-closed", "Hihat_closed", 0.7, 0.25,
     {"Hihat": 1.0, "OHL": 0.4, "AmbL": 0.1, "AmbR": 0.1}),
    ("hihat-open", "Hihat_open", 0.7, 1.1,
     {"Hihat": 1.0, "OHL": 0.4, "AmbL": 0.15, "AmbR": 0.15}),
    ("crash", "Crash_right_shank", 0.85, 2.2,
     {"OHR": 1.0, "OHL": 0.35, "AmbL": 0.25, "AmbR": 0.3}),
]


class RangeFile(io.RawIOBase):
    def __init__(self, url):
        self.url = url
        self.pos = 0
        head = urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=60)
        self.size = int(head.headers["Content-Length"])

    def seekable(self):
        return True

    def readable(self):
        return True

    def tell(self):
        return self.pos

    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else (self.pos + off if whence == 1 else self.size + off)
        return self.pos

    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        if n == 0 or self.pos >= self.size:
            return b""
        end = min(self.size, self.pos + n) - 1
        want = end - self.pos + 1
        data = b""
        for _ in range(8):
            try:
                req = urllib.request.Request(
                    self.url, headers={"Range": f"bytes={self.pos + len(data)}-{end}"}
                )
                data += urllib.request.urlopen(req, timeout=120).read()
            except http.client.IncompleteRead as e:
                data += e.partial
            if len(data) >= want:
                break
        self.pos += len(data)
        return data

    def readinto(self, b):
        d = self.read(len(b))
        b[: len(d)] = d
        return len(d)


def pick_sample(zf, folder, rank):
    root = ET.fromstring(zf.read(f"DRSKit/{folder}/{folder}.xml"))
    samples = sorted(root.iter("sample"), key=lambda s: float(s.get("power")))
    chosen = samples[min(len(samples) - 1, int(rank * len(samples)))]
    channels = {a.get("channel"): int(a.get("filechannel")) for a in chosen.iter("audiofile")}
    file = next(chosen.iter("audiofile")).get("file")
    return f"DRSKit/{folder}/{file}", channels


def read_wav(data):
    if data[:4] != b"RIFF" or data[8:12] != b"WAVE":
        raise ValueError("not a WAV file")
    pos, fmt, frames = 12, None, None
    while pos < len(data):
        cid, size = data[pos:pos + 4], struct.unpack("<I", data[pos + 4:pos + 8])[0]
        body = data[pos + 8:pos + 8 + size]
        if cid == b"fmt ":
            fmt = struct.unpack("<HHIIHH", body[:16])
        elif cid == b"data":
            frames = body
        pos += 8 + size + (size & 1)
    tag, nch, rate, _, _, bits = fmt
    width = bits // 8
    count = len(frames) // (width * nch)
    chans = [array.array("f", bytes(4 * count)) for _ in range(nch)]
    scale = float(1 << (bits - 1))
    for i in range(count):
        base = i * width * nch
        for c in range(nch):
            off = base + c * width
            if tag == 3 and width == 4:
                v = struct.unpack_from("<f", frames, off)[0]
            else:
                raw = int.from_bytes(frames[off:off + width], "little", signed=True)
                v = raw / scale
            chans[c][i] = v
    return rate, chans


def mixdown(rate, chans, mapping, weights, seconds):
    n = len(chans[0])
    out = [0.0] * n
    for name, w in weights.items():
        ch = chans[mapping[name] - 1]
        for i in range(n):
            out[i] += ch[i] * w
    # onset: first sample above 2% of peak, keep 2 ms of pre-roll
    peak = max(abs(v) for v in out) or 1.0
    onset = next(i for i, v in enumerate(out) if abs(v) > 0.02 * peak)
    start = max(0, onset - int(0.002 * rate))
    out = out[start:start + int(seconds * rate)]
    # resample to OUT_RATE (linear)
    if rate != OUT_RATE:
        ratio = rate / OUT_RATE
        m = int(len(out) / ratio)
        res = []
        for j in range(m):
            x = j * ratio
            k = int(x)
            f = x - k
            a = out[k]
            b = out[k + 1] if k + 1 < len(out) else a
            res.append(a + (b - a) * f)
        out = res
    # 30% tail fade-out, normalise to -1 dBFS
    fade = int(len(out) * 0.3)
    for i in range(fade):
        out[len(out) - fade + i] *= 1 - i / fade
    peak = max(abs(v) for v in out) or 1.0
    gain = 0.89 / peak
    return [v * gain for v in out]


def write_wav(path, samples):
    pcm = array.array("h", (max(-32767, min(32767, int(round(v * 32767)))) for v in samples))
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(pcm) * 2) + b"WAVE")
        f.write(b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, OUT_RATE, OUT_RATE * 2, 2, 16))
        f.write(b"data" + struct.pack("<I", len(pcm) * 2) + pcm.tobytes())


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    zf = zipfile.ZipFile(io.BufferedReader(RangeFile(URL), buffer_size=1 << 20))
    for name, folder, rank, seconds, weights in HITS:
        path, mapping = pick_sample(zf, folder, rank)
        rate, chans = read_wav(zf.read(path))
        out = os.path.join(OUT_DIR, f"{name}.wav")
        write_wav(out, mixdown(rate, chans, mapping, weights, seconds))
        print(f"{name}: {path} -> {out} ({os.path.getsize(out)} bytes)")


if __name__ == "__main__":
    main()
