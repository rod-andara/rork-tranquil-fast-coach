# Build 108 screenshot assessment — 18 October 2026

Owner supplied seven original iPhone screenshots for review. No files were edited or uploaded to App Store Connect during this assessment. Do not copy personal weights, goal values or fasting-history values into public repository documentation or publish screenshots without confirming the chosen content.

## Technical checks

`IMG_6334.PNG` through `IMG_6340.PNG`: all 1206 × 2622, no alpha. These match an accepted portrait size for the required medium Dynamic Island iPhone category. The originals remain in the owner's Downloads directory. Use originals, not the resized conversation previews.

## Selection recommendation

| File | Assessment |
|---|---|
| IMG_6335.PNG | Best current choice: light-mode active-fast screen, clear key functionality and coherent elapsed time/percentage. |
| IMG_6334.PNG | Possible Timer overview; name and personal fast history visible. A zero streak is not automatically defective and need not be falsified for marketing. |
| IMG_6337.PNG | Best Progress composition of this set: chart and Health connection. Personal health data visible, first date label partially clipped; use only with owner's explicit public-use confirmation or recapture using a separate sample profile. |
| IMG_6336.PNG | Not preferred: chart mostly below the viewport; top Change card has a confirmed baseline-selection defect. |
| IMG_6338.PNG | Dark Timer; black status-bar text/icons are difficult to read. Known contrast issue, not evidence of corrupt data. |
| IMG_6339.PNG | Dark active-fast screen; same status-bar contrast issue. |
| IMG_6340.PNG | Dark Progress, chart cut off and top Change issue; not preferred. |

A concise final set can be an active-fast screen, Timer overview, clear Progress chart and Learn. No need for seven near-duplicate images, invented achievements or an unusually smooth weight-loss curve. Ordinary fluctuations are legitimate. Mirroring is useful to arrange/check screens, but original phone screenshots preserve Apple's native dimensions.

## Confirmed code defect, separate from screenshot aesthetics

`store/weightStore.ts`, `getWeightChange()`: entries are sorted newest-first in `addEntry`. When a goal exists and the current record is at/after its start date, `entries.find(e => e.date >= goal.startDate)` selects that newest/current record. Subtracting it from current weight yields zero even when weight changed since goal start. This is a code defect; do not repair it by editing the owner's weight history.

Synthetic reproduction (not user health data): newest weight 99 at date 20, older weight 100 at date 10, goal starts date 5. Existing algorithm returns 0; comparison with the earliest qualifying goal baseline returns −1. `getProgressPercentage()` separately sorts oldest-first; its zero result can be valid for a recent goal, so the screenshot alone does not establish a percentage defect.

Recommended next code work: align change and percentage baseline semantics, label the summary's time scope clearly, cover goal/no-goal and before/after-goal cases with focused tests, then build and verify the correction before final Progress screenshots. No app-source change was made as part of this assessment. Existing native status-bar contrast issue is also open; a new build for the calculation would be an opportunity to correct it.

## References

- [Apple product-page screenshot guidance](https://developer.apple.com/app-store/product-page/): real app UI, distinct features, first screenshots communicate the core experience.
- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).
