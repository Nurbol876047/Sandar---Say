"""
Generates the Kazakh word audio used by the sound-differentiation exercises
(р-л, с-ш, н-ң — see src/data/speechContent.ts) as public/audio/words-kk/*.mp3.

Tilqazyna's TTS API (used by generate-kk-numbers.py) was returning 502s when this was
written, so this goes straight to the offline path: facebook/mms-tts-kaz (stochastic —
quality varies by random seed) + a local faster-whisper ASR pass to score each seed's
output against the intended word, picking the best-scoring one per word. Same approach
as scripts/search-kk-number-seed.py, but it synthesizes the final mp3 directly instead of
just reporting a seed to paste elsewhere.

Requirements: torch, transformers, faster-whisper, scipy, ffmpeg on PATH (all already
used by the other scripts/venv in this repo).

    python scripts/generate-kk-words.py
    python scripts/generate-kk-words.py --word алма --seeds 60
"""

import argparse
import difflib
import os
import re
import subprocess

import numpy as np
import torch
from scipy.io import wavfile
from transformers import VitsModel, AutoTokenizer
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, "kk_audio_raw", "words")
OUT_DIR = os.path.join(ROOT, "public", "audio", "words-kk")

MODEL_ID = "facebook/mms-tts-kaz"

# Must match the word lists in src/data/speechContent.ts (SOUND_PAIRS).
WORDS = [
    # rl
    "қарбыз", "алма", "орындық", "жылан", "арыстан", "балық", "торғай", "гүл",
    # sh
    "су", "шана", "құс", "шар", "сағат", "ағаш", "сиыр", "шөп",
    # nn
    "нан", "таң", "ана", "мың", "күн", "аң", "ән", "қоңырау",
]


def normalize(s: str) -> str:
    s = s.lower().strip()
    return re.sub(r"[^a-zа-яәғқңөұүhі]", "", s)


def score(target: str, got: str) -> float:
    if not got:
        return 0.0
    return difflib.SequenceMatcher(None, target, got).ratio()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--word", help="Only generate this Kazakh word (default: all)")
    ap.add_argument("--words", help="Comma-separated list of words to (re)generate")
    ap.add_argument("--seeds", type=int, default=25, help="How many seeds (0..N-1) to try per word")
    ap.add_argument("--asr-model", default="small", help="faster-whisper model size (tiny/small/medium/...)")
    args = ap.parse_args()

    if args.words:
        words = [w.strip() for w in args.words.split(",") if w.strip()]
    elif args.word:
        words = [args.word]
    else:
        words = WORDS

    print(f"Loading {MODEL_ID}...")
    model = VitsModel.from_pretrained(MODEL_ID)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model.eval()
    sr = model.config.sampling_rate

    print(f"Loading faster-whisper ({args.asr_model})...")
    asr = WhisperModel(args.asr_model, device="cpu", compute_type="int8")

    def transcribe(audio: np.ndarray) -> str:
        segments, _ = asr.transcribe(
            audio, language="kk", beam_size=1, best_of=1, vad_filter=False,
            condition_on_previous_text=False, without_timestamps=True,
        )
        return normalize("".join(seg.text for seg in segments))

    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    for word in words:
        target = normalize(word)
        inputs = tokenizer(word, return_tensors="pt")
        best = None  # (score, seed, asr_text, audio)
        for seed in range(args.seeds):
            torch.manual_seed(seed)
            with torch.no_grad():
                out = model(**inputs).waveform
            audio = out.squeeze().cpu().numpy().astype(np.float32)
            got = transcribe(audio)
            s = score(target, got)
            if best is None or s > best[0]:
                best = (s, seed, got, audio)
            if s >= 0.999:
                break

        s, seed, got, audio = best
        print(f"{word:>10}: best seed={seed:<3} score={s:.2f}  asr={got!r}")

        wav_path = os.path.join(RAW_DIR, f"{word}.wav")
        pcm16 = np.clip(audio, -1.0, 1.0)
        pcm16 = (pcm16 * 32767).astype(np.int16)
        wavfile.write(wav_path, sr, pcm16)

        mp3_path = os.path.join(OUT_DIR, f"{word}.mp3")
        duration = float(
            subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav_path],
                capture_output=True, text=True, check=True,
            ).stdout.strip()
        )
        fade_out_start = max(0.0, duration - 0.04)
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", wav_path,
                "-af",
                f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.015,afade=t=out:st={fade_out_start}:d=0.04",
                "-ar", "22050", "-ac", "1", "-b:a", "96k",
                mp3_path, "-loglevel", "error",
            ],
            check=True,
        )

    print(f"Wrote {len(words)} mp3 files to {OUT_DIR}")


if __name__ == "__main__":
    main()
