# OSS調査：ESP32 マルチカメラ同時シャッター

- 作成日: 2026-06-03
- 目的: 4眼/5眼の小型カメラを **同時シャッター** で撮るために、**ESP32 ベースで使える OSS / 先行プロジェクト**が存在するかを調査
- 関連: `development/docs/製品コンセプト概要.md` / `marketing/docs/競合調査_ウィグルグラム・トイカメラ.md`

---

## 1. 結論(エグゼクティブサマリー)

1. **ESP32で「4眼同時撮影」する先行事例は実在する**(Hackaday の4眼ウィグル、KameraflY、公式ドライバ)。土台になるコードは揃う。
2. **ただし「そのまま使える“同時シャッター完成OSS”」は無い。** 各プロジェクトとも「命令を同時に送る」ところまでで、**実露光タイミングの精密同期は未解決**。
3. 核心課題は **OV2640 がローリングシャッター＋各センサが独立クロック**であること。GPIO/シリアルで「今撮れ」と送っても、**同期するのは命令だけ、露光位相はバラバラ**(数〜数十ms)。
4. → **静止物・ゆっくりした被写体なら ESP32-CAM + シリアルトリガで十分**。**動く被写体をピタッと止める**のを売りにするなら、**センサ選定(グローバルシャッター/外部トリガ)＋クロック共有の自社設計**が必須。
5. これは競合調査の Alibaba 結論(=既製完成品が無く**自前カスタム開発が必要**)とも一致。

---

## 2. 見つかった OSS / 先行プロジェクト一覧

| プロジェクト | 内容 | 同期方式 | コード/ライセンス | 有用度 |
|---|---|---|---|---|
| **Wigglegram esp32-cam**(Hackaday.io #188437) | **まさに本件**。4眼ESP32-CAMでウィグル撮影、SDへ保存 | 親機(dom)の **TXピン → 全子機のRXピン** にシリアルでトリガ信号 | **公開リポジトリ/ライセンス無し**(製作ログのみ) | ◎ 設計の最良の参考。ただし流用可能なコードは無い |
| **KameraflY**(npsantini) | ESP32-CAMの「群れ」最大256台、撮影画像をWebサーバに集約。1台$13前後 | **WiFi無線**・Blynkアプリ。約10ms間隔だが**真の時刻同期は未実装**と作者明言(改善は将来予定) | フル一式(Arduino C++/PHP/PCB/3D)あり・**明示ライセンス無し** | ○ 多眼制御の土台。**無線同期は被写体ブレに弱い** |
| **playfultechnology/esp32-cam** | ESP32-CAM制御スクリプト(タイムラプス/フラッシュ/**トリガ制御**) | 外部トリガ対応の素地あり | 要README確認 | ○ 単機トリガの土台に流用可 |
| **espressif/esp32-camera**(公式ドライバ) | ESP32シリーズ公式カメラドライバ。全ての土台 | — | **Apache-2.0(明確なOSS)** | ◎ 必須の基盤 |
| Issue #192「Precise Frame Sync with 2 ESP32 Cameras」 | 2台以上の**フレーム同期に関する公式Issue議論** | GPIO/外部クロック等を議論 | (議論スレ) | ◎ 技術検討時に通読すべき一次情報 |
| **s60sc/ESP32-CAM_MJPEG2SD** | 成熟したカメラ録画/配信アプリ | 複数ストリーム同期は**外部ツール(go2rtc)頼み** | GPL系 | △ 配信向き。シャッター同期用途ではない |
| **strawlab/triggerbox**(ESP32外) | 多カメラ同期トリガ装置(genlock的発想) | ハード同期トリガ | OSS | 参考(同期設計の考え方) |

---

## 3. 技術的な勘所：なぜ“真の同時”が難しいか

- ESP32-CAM の定番センサ **OV2640 はローリングシャッター**。各センサが**それぞれ独立した自走クロック**で動作。
- GPIO/シリアルで「今撮れ」を送っても、**同期するのは“命令”だけ**で、各センサは撮影フレームの異なる位相にいる → **実露光が数〜数十msズレる**。
- 結果、**動く被写体では各眼の像がズレ・ブレ**、ウィグルが「視点移動」ではなく「ガタつき」に見える。
  - 実証: Hackaday の4眼プロジェクトも **「撮影後に手動で位置合わせが必要だった」** と報告。これが現実の壁。

### 本気で「時間を止める」ための方向(要検討)
1. **共通 XCLK(マスタークロック)を全センサへ配給** → 位相を揃える
2. **FSIN / フレーム同期ピン**を持つセンサを使う(OV2640 は綺麗に出せない)
3. **グローバルシャッター/外部トリガ対応センサ**へ寄せる
   - 候補例: OV7251系(グローバルシャッター)、Raspberry Pi Global Shutter Camera、Arducam の同期マルチカメラ(複数カメラを1本のMIPIに束ねて同時露光)等
   - ※プラットフォームが ESP32 から RP2040 / Raspberry Pi 等へ広がる可能性も含めて要検討

---

## 4. 製品方針への示唆

- **MVP/トイ路線(静止〜ゆっくり被写体)**: ESP32-CAM + シリアルトリガ(Hackaday方式) + 撮影後ソフト位置合わせ。**OSS土台で素早く試作可能**。
- **差別化を「動体でもピタッと止まる」に置く場合**: センサ選定とクロック同期を**自社で作り込む**前提。OSS既製では埋まらない核心競争領域。
- 画像合成(位置合わせ→GIF化)は **本体内で完結 or スマホアプリ側** のどちらに置くか、§製品コンセプトのオープン論点と接続。

---

## 5. 次アクション候補
- [ ] espressif/esp32-camera **Issue #192** を通読し、XCLK共有/外部トリガの実現可否を技術評価
- [ ] **精密同期の方式比較**(共通XCLK方式 vs グローバルシャッターセンサ vs MIPI束ね)を別ドキュメントで深掘り
- [ ] Hackaday #188437 / KameraflY のコードを実機で試作し、**同期ズレの実測**(動体でどの程度ガタつくか)
- [ ] ライセンス確認(KameraflY・playfultechnology は明示ライセンス未確認 → 商用利用可否を要精査)

---

## 6. 出典(主要URL)
- Wigglegram esp32-cam(Hackaday.io): https://hackaday.io/project/188437-wigglegram-esp32-cam
- KameraflY(GitHub): https://github.com/npsantini/KameraflY-ESP32-CAM-Camera-Swarm-System
- playfultechnology/esp32-cam: https://github.com/playfultechnology/esp32-cam
- espressif/esp32-camera(公式・Apache-2.0): https://github.com/espressif/esp32-camera
- Issue #192 Precise Frame Sync with 2 ESP32 Cameras: https://github.com/espressif/esp32-camera/issues/192
- s60sc/ESP32-CAM_MJPEG2SD: https://github.com/s60sc/ESP32-CAM_MJPEG2SD
- strawlab/triggerbox: https://github.com/strawlab/triggerbox
