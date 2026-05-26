#!/usr/bin/env node
/**
 * 1회성 도구 — Google Sites 페이지의 13개 산업 파트너 로고를 받아 partner_logos_temp/ 에 저장.
 * 다운로드 끝나면 사용자가 Google Drive에 업로드 → 시트에 공유 링크 입력.
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(PROJECT_ROOT, "partner_logos_temp");

const LOGOS = [
  ["01_T3Q",            "㈜티쓰리큐",                "https://lh3.googleusercontent.com/sitesv/AA5AbUBn57HpGtSnsIEqfsVaHiL9UgjLJc_uRmMXhM8ibmKgHYq7KNm5VrXc06AMYEeB5OI1NKQlFq0H5h_jf-YWhIc3sVtFWYPKLjFXnxOtsqFeBQN7VikjEoqSNPd5wSfeefRr9--5gEHfcUbQWmbjHzt5x4rSJbujehNeOMWBRSxFqESjQTVo_Pnfdb_40zsBO3dha87CCEes3hkNtFI9vUnElvok_NyhaDv3=w1280"],
  ["02_CJ_OliveNetworks","CJ 올리브네트웍스",         "https://lh3.googleusercontent.com/sitesv/AA5AbUCwdWGcP4K_yXKu2U5LGoelcss92Ylaf6BUVOkWBD5orANOd7W-stXnJkzRaXCqVkSek4UDBG5TIbHFkk4AScSzx0O9q2BaF_tRlAKRp4oB_MdhBfb7T5k2eUKoSFB0vAWZfrU-O5E82zvPaqUPOgBwIIrw_PWSsYct38fuei8c0rymnzbfBx4s_Np0ubEEzxuLOnszTK72vmmuxe0bhxg5wC8_ORmzmtknA3g=w1280"],
  ["03_Samsung_SAIT",   "삼성전자 종합기술원",        "https://lh3.googleusercontent.com/sitesv/AA5AbUA0cu8e3fYu8seyby7r2pSCVeuKsDF-Mr3AyG63DoAfEor5Nr_TTkpYqGAyDyRrg3xGzedvXe8nv1KikoP57Z-m7Rtk1aJXOxA2cVBRDydN0PhtJyiE53HLMY8huiz2QDh7nnJmLV9soPNyZ5w9AcNCUxcIxGlsvVEbZ9qEZos20RwNUNcWxyBwsyRNGqhhQV7vK1xps-x0OySMK6FXN5aZlvYCs5PP1BM1=w1280"],
  ["04_JEOL_Korea",     "㈜지올 코리아",              "https://lh3.googleusercontent.com/sitesv/AA5AbUCdwtjTH3xMD5VeoKdECHRdunIyEj3Hr5pWHabEU9MSA7fkiWjc4NOpRLSoqMNLvGLZ0w8yJHk_72vVepaHYNtc5pg6XlYxlBLaa1HJruBzIYGtkT8x-bc7Oq5NTx-Eef1nitEsllBElAd_UstgUIrtadSdcjOWDxl-WpfA0P4oxu7doIvWunIzDO0SYk4hvRgiqRbdt3kp-sUq7cMtE9BiYJPSmfycsGj2kQQ=w1280"],
  ["05_ThermoFisher_EM","ThermoFisher 전자현미경 사업부","https://lh3.googleusercontent.com/sitesv/AA5AbUAGXuuQR8QZlSAXademab638IWneuI8S34KwFr-gQHE7-1l_he-OgGLXR31Ps9ttECAY9PbPvVI3xKUEOCIauAhM2fbKfABY8a2aooB5oIRvBYgW_K71n1FYYQy-mlKncih8-jULROrLBAMQcFh3WVFfwl2wLvm7FcIp3aqaMM2QIKvsOVghrAgn1zmNLZ8vKBLmzrKNgQTY3AYxN31VIT-tihRXip3HrN1MDw=w1280"],
  ["06_NanoBioSystem",  "㈜나노바이오시스템",          "https://lh3.googleusercontent.com/sitesv/AA5AbUDbTgvnsifcpfYWbBdqLV2lTaIlPQIU8AOM_WOnfBnhdKdKxnYbo7GwoJFwIpf0F1BNACQ-n63GRxlxCCIYojSUPf4ylM3nBqLbq6qTiXYDMGoQI1wg7ALCcHUY_pY3djqnLOLPGUbmntM36rYBnNq6mE4GcWiZthMqHqven-70njvF7WR0Hn-rY099ncHt5Mzpac1hcTtPy-6L4Zz1n9l9g1YAdcRSnQi9=w1280"],
  ["07_Clavis",         "㈜클라비스 기업부설연구소",    "https://lh3.googleusercontent.com/sitesv/AA5AbUCHOFoCLwjqTHrDTFxCf3ijxQSxlZxLq9zqCfPx3UHqdZqBPXaBDbt3bJPBFOpJAATT__cKuHCsJJWMuiD2yLulnJN4M1I_RiiHnLwbe1KyGFH4mLrMIuiO_ZQpfpfIQ4764bf6C2ds4sFB0BwdOM4xq6he0mF6GmVpWKjDNhfXMguVM_Aeuaf7DgX3k7eJ5n2eOWPd1uIA1JTVKTjipq6EEJpJh7fgarK0oTA=w1280"],
  ["08_AcroCell_Bio",   "㈜아크로셀 바이오사이언스",    "https://lh3.googleusercontent.com/sitesv/AA5AbUB_nLRyAHX8pFea-9uFydeNgLLDejewS7g_vXPQHSB-3Fmn0Eg-Nd3TTkJWnNomo1uwQW2u9PceXecRB8CeDIDOFTXWF5nQXGCk1DmYGvWjxrmNlXNkbOlVUNfUPbx-vSaYohavW7PEgN5vUn3ZqRctPcTMlveHKyIuf46X-6fmD9NWi0vK2at2Yi6QfLk5_NHjXPGPsrNzJPNxwTzqPUhULAHlycjnKwnD=w1280"],
  ["09_EJC_Therapeutics","㈜이지씨테라퓨틱스",          "https://lh3.googleusercontent.com/sitesv/AA5AbUB6VYZbdn-weuK3Xlj4KloxszlspsLNyQ5_8I4Imfqm6Y5LynRBDdd90CQ8WVeQElR67S34dMiOtwJv9J1uaOYZZxTxqvxBsBYANaVQ6OZlSrSLrlAoUj13MXMW-l8hvq2RUA59GXA_sNL25RKA-97HQ-npTQ_u5TLUhB1QSPE3qtoNPfkpL4q_6wyf0446B9CRAWytNmFYerUp8Dra7bi3tbqm5cAwfaSd1FU=w1280"],
  ["10_Ceratgen",       "㈜세라트젠",                  "https://lh3.googleusercontent.com/sitesv/AA5AbUDJk2yw-N7RAJiyl_u7nG0RAKVhleIRVApnhwGYMiuT1gY_vmWA-s74HREck8EGi-XCYOLavL33Jyhp6BycZkgsFHld0O65geYU8CAczOJLFLG3iprzfY7HMiVi795dRKMnWZxNwus9NxGjf-2iKBJuEjJBbYafg7V8Pj0iPeORv23mfIB6YuTa0bFbKZhpn6xWl1OuoeeZ83TxEJiWlixinlGZLy7i9yWof1U=w1280"],
  ["11_DeepCardio",     "㈜딥카디오",                  "https://lh3.googleusercontent.com/sitesv/AA5AbUD905XyFmpOflO_f-xsww3dJM51o-R2bK9eKwlJW_SOUAMvdwws5KHnNlquuuvKDrJnsGC_ayVf7YbzrHoG4CKBnM_hWpMSE_jIKAjL5vjeZD-kjAFXwwqfi1a2s3-I3kOqYygdCSkm08ceHMXI-ct0i7kWgD5ciORMxrL6HS4nneqreABtmlNAROJGJhDBQ_HCEDA-AkRP0CV6s4VfauOrsOsu9B1eaPeTLfo=w1280"],
  ["12_Neurophet",      "뉴로핏",                      "https://lh3.googleusercontent.com/sitesv/AA5AbUA_SfWdtybo_gVOszVcZ0DlLVvrcEuownP1lc3DIboT6c-qdK2nmDhvzmujulOrDq579rJasXixMB507nTKdNXGzqqVVFJ-dGPBL7i4Xb_igzjwshyambwmCvNU1IrI9xQXBm9UE_TTIApDWYuVaNwcR7STHaSWt9h_mzsPvf-fIkZBCmBXba-zEz1heMvkRFddlf2LPCLtyotwU-OE017B4CcLbVVbVQFW=w1280"],
  ["13_JEIOTECH",       "㈜제이오텍",                  "https://lh3.googleusercontent.com/sitesv/AA5AbUBLMyCYKBFmMgaEuBaf_4IQTKKGqZmMhSDMPgQM8T1pZQpJdjAQJj9DIx2fMYoak_bo3i7OsmajXlm3MUdvr8H7SexS_44_JvtgcIkYNWVSqzlnoSB_V9lA2pAvhLoQpL3tWEwD6eMAzvjGRTmI3xFbXKZAnnac4puRHhTXTXS9m23ly8ZRkQy5Nd_lShWbLAxRmJEyOElXuSKPIGR7Dt_XVCvn3V-rEU41TOo=w1280"],
];

mkdirSync(OUT_DIR, { recursive: true });
console.log(`📁 Output dir: ${OUT_DIR}\n`);

let ok = 0, fail = 0;
for (const [filename, korean, url] of LOGOS) {
  try {
    const resp = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!resp.ok) {
      console.log(`  ❌ ${filename} (${korean}): HTTP ${resp.status}`);
      fail++;
      continue;
    }
    const buf = Buffer.from(await resp.arrayBuffer());
    const out = resolve(OUT_DIR, `${filename}.jpg`);
    writeFileSync(out, buf);
    console.log(`  ✅ ${filename} (${korean}) — ${(buf.length / 1024).toFixed(1)} KB`);
    ok++;
  } catch (e) {
    console.log(`  ❌ ${filename} (${korean}): ${e.message}`);
    fail++;
  }
}

console.log(`\n📊 Result: ${ok} 성공 / ${fail} 실패 (총 ${LOGOS.length}개)`);
