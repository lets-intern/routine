// public/photos/ 안의 이미지 파일 목록을 lib/photos.ts 로 자동 생성합니다.
// 빌드(npm run build) 전에 자동 실행되어, 폴더에 넣은 사진이 그대로 갤러리에 반영됩니다.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "photos");
let files = [];
try {
  files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "ko"));
} catch {
  files = [];
}
const arr = files.map((f) => "/photos/" + encodeURIComponent(f));
const out =
  "// 자동 생성 파일 (scripts/gen-photos.mjs). 직접 수정하지 마세요.\n" +
  "export const PHOTOS: string[] = " +
  JSON.stringify(arr, null, 2) +
  ";\n";
fs.writeFileSync(path.join(process.cwd(), "lib", "photos.ts"), out);
console.log(`[gen-photos] ${arr.length}개 사진 → lib/photos.ts`);
