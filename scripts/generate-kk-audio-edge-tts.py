"""
Regenerates ALL pre-recorded Kazakh audio (public/audio/words-kk/*.mp3 and
public/audio/numbers-kk/*.mp3) with Microsoft Edge TTS's kk-KZ-AigulNeural voice
(female), replacing whatever engine produced the file previously (facebook/mms-tts-kaz
for words, Tilqazyna/Думан for numbers).

Must be run from a network that can reach wss://speech.platform.bing.com — this
environment's sandbox and the user's own machine have both hit a 403 there before,
but a newer edge-tts release (>=7.3.1) has worked. If it 403s, try:
    pip install -U edge-tts --break-system-packages

Requirements: edge-tts (pip install edge-tts / pipx install edge-tts)

    python3 scripts/generate-kk-audio-edge-tts.py
    python3 scripts/generate-kk-audio-edge-tts.py --word алма   # just one word
    python3 scripts/generate-kk-audio-edge-tts.py --numbers-only
    python3 scripts/generate-kk-audio-edge-tts.py --words-only
"""

import argparse
import asyncio
import os

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_DIR = os.path.join(ROOT, "public", "audio", "words-kk")
NUMBERS_DIR = os.path.join(ROOT, "public", "audio", "numbers-kk")

VOICE = "kk-KZ-AigulNeural"

NUMBER_WORDS = {
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


async def synthesize(text: str, out_path: str) -> None:
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(out_path)
    print(f"  {os.path.basename(out_path)} <- {text!r}")


async def generate_words(only_word: str | None) -> None:
    os.makedirs(WORDS_DIR, exist_ok=True)
    words = [only_word] if only_word else sorted(
        os.path.splitext(f)[0] for f in os.listdir(WORDS_DIR) if f.endswith(".mp3")
    )
    print(f"Words ({len(words)})...")
    for word in words:
        await synthesize(word, os.path.join(WORDS_DIR, f"{word}.mp3"))


async def generate_numbers(only_word: str | None) -> None:
    if only_word:
        return
    os.makedirs(NUMBERS_DIR, exist_ok=True)
    print(f"Numbers ({len(NUMBER_WORDS)})...")
    for key, word in NUMBER_WORDS.items():
        await synthesize(word, os.path.join(NUMBERS_DIR, f"{key}.mp3"))


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--word", help="Regenerate just this one word (words-kk only)")
    parser.add_argument("--words-only", action="store_true")
    parser.add_argument("--numbers-only", action="store_true")
    args = parser.parse_args()

    if args.word:
        await generate_words(args.word)
        return

    if not args.numbers_only:
        await generate_words(None)
    if not args.words_only:
        await generate_numbers(None)


if __name__ == "__main__":
    asyncio.run(main())
