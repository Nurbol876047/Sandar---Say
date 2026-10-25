// Бір рет іске қосылады: data/content.json ішіндегі әр әріп пен сөзді
// дауыстап оқытып, public/audio/{id}.mp3 файлына сақтайды.
// Қайта іске қосқанда бар файлдарды қайта жазбайды — тек жаңаларын қосады.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { EdgeTTS } from "edge-tts-universal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT_PATH = path.join(ROOT, "data", "content.json");
const AUDIO_DIR = path.join(ROOT, "public", "audio");

const VOICE = "kk-KZ-AigulNeural"; // әйел дауысы
const RATE = "-15%"; // балаларға арналған баяу жылдамдық

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function flattenItems(letters) {
  const items = [];
  for (const letter of letters) {
    items.push(letter);
    for (const word of letter.words ?? []) {
      items.push(word);
    }
  }
  return items;
}

async function synthesizeToFile(text, outPath) {
  const tts = new EdgeTTS(text, VOICE, { rate: RATE });
  const result = await tts.synthesize();
  const buffer = Buffer.from(await result.audio.arrayBuffer());
  await writeFile(outPath, buffer);
}

async function main() {
  const content = JSON.parse(await readFile(CONTENT_PATH, "utf8"));
  const items = flattenItems(content);

  await mkdir(AUDIO_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    const outPath = path.join(AUDIO_DIR, `${item.id}.mp3`);

    if (await fileExists(outPath)) {
      skipped++;
      continue;
    }

    const textToSpeak = item.speak || item.text;

    try {
      await synthesizeToFile(textToSpeak, outPath);
      generated++;
      console.log(`✓ ${item.id}.mp3  ("${textToSpeak}")`);
    } catch (err) {
      failed++;
      console.error(`✗ ${item.id}  ("${textToSpeak}") — ${err.message}`);
    }
  }

  console.log("\n--- Дайын ---");
  console.log(`Жасалды: ${generated}, өткізілді (бар еді): ${skipped}, қате: ${failed}`);
}

main().catch((err) => {
  console.error("Скрипт қатемен аяқталды:", err);
  process.exit(1);
});
