"""
Generates the Kazakh number-word audio used by useNumberVoice (public/audio/numbers-kk/*.mp3).

Uses the public Tilqazyna TTS API (https://speech.tilqazyna.kz, a Kazakh government/
Nazarbayev University language-tech portal built on Piper) with the "Думан" male voice
(kk-er2.onnx) — of the voices on offer (Раушан/Айгүл female, Арман/Думан male) this is the
one that came out clearest on these specific number words. The API is called once per word
here, at generation time; the running app never talks to it — it only ever plays the
committed mp3 files, same as before.

An earlier version of this script ran facebook/mms-tts-kaz locally (via torch/transformers,
seed search + ASR self-check). That approach is still viable as a fully-offline fallback —
see git history / scripts/search-kk-number-seed.py — but Tilqazyna's voices were simply more
reliable on these words without any of that tuning.

Requirements: `requests`, and ffmpeg available on PATH.

    python scripts/generate-kk-numbers.py
    # fetches WAV per word from the API, writes MP3s to public/audio/numbers-kk/
"""

import os
import subprocess

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, "kk_audio_raw")
OUT_DIR = os.path.join(ROOT, "public", "audio", "numbers-kk")

API_URL = "https://api.tilqazyna.kz/api/tts"
VOICE = "kk-er2.onnx"  # Думан

WORDS = {
    "0": "нөл",
    "1": "бір",
    "2": "екі",
    "3": "үш",
    "4": "төрт",
    "5": "бес",
    "6": "алты",
    "7": "жеті",
    "8": "сегіз",
    "9": "тоғыз",
    "10": "он",
}


def synthesize():
    os.makedirs(RAW_DIR, exist_ok=True)
    print(f"Fetching audio from {API_URL} (voice={VOICE})...")
    for key, word in WORDS.items():
        resp = requests.post(API_URL, json={"text": word, "voice": VOICE}, timeout=30)
        resp.raise_for_status()
        path = os.path.join(RAW_DIR, f"{key}.wav")
        with open(path, "wb") as f:
            f.write(resp.content)
        print(f"  {key} -> {word!r} ({len(resp.content)} bytes)")


def encode_mp3():
    os.makedirs(OUT_DIR, exist_ok=True)
    for key in WORDS:
        src = os.path.join(RAW_DIR, f"{key}.wav")
        dst = os.path.join(OUT_DIR, f"{key}.mp3")
        duration = float(
            subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                capture_output=True, text=True, check=True,
            ).stdout.strip()
        )
        fade_out_start = max(0.0, duration - 0.04)
        # Deliberately NOT trimming silence here: an earlier version used silenceremove and it
        # occasionally chewed into real speech at the edges of a word. A short fade in/out avoids
        # click/pop artifacts without that risk.
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", src,
                "-af",
                f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.015,afade=t=out:st={fade_out_start}:d=0.04",
                "-ar", "22050", "-ac", "1", "-b:a", "96k",
                dst, "-loglevel", "error",
            ],
            check=True,
        )
    print(f"Wrote {len(WORDS)} mp3 files to {OUT_DIR}")


if __name__ == "__main__":
    synthesize()
    encode_mp3()
