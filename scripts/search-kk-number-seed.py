"""
Finds a clearer-sounding random seed for one (or all) Kazakh number words.

facebook/mms-tts-kaz is stochastic — the same text synthesized with different seeds can land
anywhere from crisp to mumbled. This script brute-forces a bunch of seeds per word, transcribes
each take with a local Kazakh speech-to-text pass (faster-whisper), and reports the seed whose
transcription best matches the intended word — a cheap, repeatable stand-in for "does this sound
right" when nobody can literally listen to every candidate.

Requirements (on top of generate-kk-numbers.py's):
    pip install faster-whisper

Usage:
    python scripts/search-kk-number-seed.py            # search all 11 numbers, 30 seeds each
    python scripts/search-kk-number-seed.py --word үш --seeds 60   # focus + widen for one word

Paste the winning seed back into WORDS in generate-kk-numbers.py, then rerun that script.
"""

import argparse
import difflib
import re

import numpy as np
import torch
from transformers import VitsModel, AutoTokenizer
from faster_whisper import WhisperModel

MODEL_ID = "facebook/mms-tts-kaz"

ALL_WORDS = {
    "0": "нөл", "1": "бір", "2": "екі", "3": "үш", "4": "төрт",
    "5": "бес", "6": "алты", "7": "жеті", "8": "сегіз", "9": "тоғыз", "10": "он",
}


def normalize(s: str) -> str:
    s = s.lower().strip()
    return re.sub(r"[^a-zа-яәғқңөұүhі]", "", s)


def score(target: str, got: str) -> float:
    if not got:
        return 0.0
    return difflib.SequenceMatcher(None, target, got).ratio()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--word", help="Only search this Kazakh word (default: all)")
    ap.add_argument("--seeds", type=int, default=30, help="How many seeds (0..N-1) to try per word")
    ap.add_argument("--asr-model", default="small", help="faster-whisper model size (tiny/small/medium/...)")
    args = ap.parse_args()

    words = {args.word: args.word} if args.word else ALL_WORDS

    print(f"Loading {MODEL_ID}...")
    model = VitsModel.from_pretrained(MODEL_ID)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model.eval()

    print(f"Loading faster-whisper ({args.asr_model})...")
    asr = WhisperModel(args.asr_model, device="cpu", compute_type="int8")

    def transcribe(audio: np.ndarray) -> str:
        segments, _ = asr.transcribe(
            audio, language="kk", beam_size=1, best_of=1, vad_filter=False,
            condition_on_previous_text=False, without_timestamps=True,
        )
        return normalize("".join(seg.text for seg in segments))

    for key, word in words.items():
        target = normalize(word)
        inputs = tokenizer(word, return_tensors="pt")
        best = None  # (score, seed, asr_text)
        for seed in range(args.seeds):
            torch.manual_seed(seed)
            with torch.no_grad():
                out = model(**inputs).waveform
            audio = out.squeeze().cpu().numpy().astype(np.float32)
            got = transcribe(audio)
            s = score(target, got)
            if best is None or s > best[0]:
                best = (s, seed, got)
            if s >= 0.999:
                break
        print(f"{key:>3} {word:>6}: best seed={best[1]:<3} score={best[0]:.2f}  asr={best[2]!r}")


if __name__ == "__main__":
    main()
