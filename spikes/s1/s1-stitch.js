// SPIKE S1 (throwaway, non-product): SSAI manifest stitching latency + validity.
// Reads content.m3u8 + ad.m3u8 (VOD), produces stitched playlist with an ad pod
// inserted at podStartSec using EXT-X-DISCONTINUITY + EXT-X-DATERANGE.
// Usage: node s1-stitch.js [iterations]
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
const CONTENT = path.join(OUT, 'content.m3u8');
const AD = path.join(OUT, 'ad.m3u8');

function parsePlaylist(text) {
  const lines = text.split(/\r?\n/);
  const segs = [];
  let init = null;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXT-X-MAP:')) {
      const m = lines[i].match(/URI="([^"]+)"/);
      if (m) init = m[1];
    }
    if (lines[i].startsWith('#EXTINF:')) {
      const dur = parseFloat(lines[i].slice(8));
      const name = lines[i + 1].trim();
      segs.push({ dur, name });
    }
  }
  return { segs, init };
}

function stitch(content, ad, podStartSec, podIndex) {
  const contentSegs = content.segs;
  const adSegs = ad.segs;
  const lines = ['#EXTM3U', '#EXT-X-VERSION:6', '#EXT-X-TARGETDURATION:6', '#EXT-X-PLAYLIST-TYPE:VOD', '#EXT-X-MEDIA-SEQUENCE:0', `#EXT-X-MAP:URI="${content.init}"`];
  let t = 0;
  let inserted = false;
  for (const s of contentSegs) {
    if (!inserted && t >= podStartSec) {
      inserted = true;
      lines.push('#EXT-X-DISCONTINUITY');
      // SCTE-35-style cue → EXT-X-DATERANGE (per ADR-0008 / brief §9)
      lines.push(
        `#EXT-X-DATERANGE:ID="pod-${podIndex}",START-DATE="2026-10-29T10:00:00.000Z",PLANNED-DURATION=${adSegs.reduce((a, b) => a + b.dur, 0).toFixed(3)},SCTE35-OUT=0xFC3020000000000000FF`
      );
      lines.push('#EXT-X-CUE-OUT:DURATION=' + adSegs.reduce((a, b) => a + b.dur, 0).toFixed(3));
      lines.push(`#EXT-X-MAP:URI="ad${podIndex}_${ad.init}"`);
      for (const a of adSegs) lines.push(`#EXTINF:${a.dur.toFixed(5)},`, `ad${podIndex}_${a.name}`);
      lines.push('#EXT-X-CUE-IN', '#EXT-X-DISCONTINUITY');
      lines.push(`#EXT-X-MAP:URI="${content.init}"`);
    }
    lines.push(`#EXTINF:${s.dur.toFixed(5)},`, s.name);
    t += s.dur;
  }
  lines.push('#EXT-X-ENDLIST');
  return lines.join('\n');
}

const iters = parseInt(process.argv[2] || '100', 10);
const content = parsePlaylist(fs.readFileSync(CONTENT, 'utf8'));
const ad = parsePlaylist(fs.readFileSync(AD, 'utf8'));
if (!content.segs.length || !ad.segs.length) throw new Error('empty playlists');

const latencies = [];
let output;
for (let i = 0; i < iters; i++) {
  const t0 = process.hrtime.bigint();
  output = stitch(content, ad, 12, 1);
  const t1 = process.hrtime.bigint();
  latencies.push(Number(t1 - t0) / 1e6);
  if (i === 0) fs.writeFileSync(path.join(OUT, 'stitched.m3u8'), output);
}
latencies.sort((a, b) => a - b);
const pct = (p) => latencies[Math.min(latencies.length - 1, Math.floor(p * latencies.length))].toFixed(3);
console.log(JSON.stringify({
  iterations: iters,
  contentSegments: content.segs.length,
  adSegments: ad.segs.length,
  contentInit: content.init,
  adInit: ad.init,
  stitchLatencyMs: { avg: (latencies.reduce((a, b) => a + b, 0) / iters).toFixed(3), p50: pct(0.5), p99: pct(0.99), max: latencies[latencies.length - 1].toFixed(3) },
  outputBytes: output.length,
}, null, 2));
