"""
Generates the Kazakh number-word audio used by useNumberVoice (public/audio/numbers-kk/*.mp3).

Runs fully offline/locally against the open facebook/mms-tts-kaz model (Meta's Massively
Multilingual Speech project) — no paid API, nothing sent over the network except the one-time
model download from Hugging Face.

facebook/mms-tts-kaz is a stochastic VITS model: its decoder injects random noise controlled by
`noise_scale`/`noise_scale_duration`, which is what made earlier takes sound slurred/mumbled on
some words. Setting both to 0 makes synthesis fully deterministic and picks the most likely
(clearest, most "read it straight") output instead of a random stylistic variation — no seed
lottery or self-transcription needed.

Requirements:
    pip install torch "transformers<5" scipy

Then, with ffmpeg available on PATH:
    python scripts/generate-kk-numbers.py
    # writes WAV to ./kk_audio_raw/, then MP3s to public/audio/numbers-kk/
"""

import os
import subprocess
import sys

import torch
from transformers import VitsModel, AutoTokenizer
from scipy.io.wavfile import write as wav_write

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, "kk_audio_raw")
OUT_DIR = os.path.join(ROOT, "public", "audio", "numbers-kk")

MODEL_ID = "facebook/mms-tts-kaz"

# word -> text. Add more entries here (any Kazakh word/phrase) to extend the vocabulary.
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
    print("Loading facebook/mms-tts-kaz...")
    model = VitsModel.from_pretrained(MODEL_ID)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model.eval()
    model.config.noise_scale = 0.0
    model.config.noise_scale_duration = 0.0

    for key, word in WORDS.items():
        inputs = tokenizer(word, return_tensors="pt")
        torch.manual_seed(0)
        with torch.no_grad():
            output = model(**inputs).waveform
        audio = output.squeeze().cpu().numpy()
        path = os.path.join(RAW_DIR, f"{key}.wav")
        wav_write(path, model.config.sampling_rate, audio)
        print(f"  {key} -> {word!r} ({len(audio) / model.config.sampling_rate:.2f}s)")


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
        # occasionally chewed into real speech at the edges of a word (e.g. "сегіз" lost ~0.9s of
        # its own ending). A short fade in/out avoids click/pop artifacts without that risk.
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
    if subprocess.run(["which", "ffmpeg"], capture_output=True).returncode == 0:
        encode_mp3()
    else:
        print("ffmpeg not found — WAV files are in", RAW_DIR, "; convert to mp3 manually.", file=sys.stderr)
