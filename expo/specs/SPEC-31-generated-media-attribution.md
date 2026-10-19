# SPEC-31 — Generated media provenance and attribution

18October2026. Owner reports using ChatGPT, Claude, Manus and Grok; onboarding images/videos specifically were generated personally with Grok.

## Findings

- [Grok consumer FAQ](https://x.ai/legal/faq), output ownership: commercial use of generated output is permitted. [Consumer terms §4](https://x.ai/legal/terms-of-service) refer users to attribution obligations; [brand guidelines](https://x.ai/legal/brand-guidelines) specify visible wording such as “Created with Grok.” Added a legible credit beside the onboarding visuals. The consumer terms exclude Grok on X; generation dates, account surface, plan and any feature-specific terms were not provided, so this check is not a determination of the user's historical contract or a blanket IP clearance.
- [OpenAI Europe terms](https://openai.com/policies/eu-terms-of-use/), Content: output rights are assigned to the user to the extent permitted by law; inputs/third-party material remain subject to others' rights.
- [Anthropic consumer terms §4](https://www.anthropic.com/legal/consumer-terms): output rights are assigned subject to compliance. The fetched official page was localized in Korean. Consumer evaluation/additional-service restrictions must not be assumed absent for every feature.
- [Manus ownership FAQ](https://help.manus.im/en/articles/13125514-do-i-own-the-assets-websites-images-videos-slides-generated-via-manus): permits personal/commercial output use, subject to law and third-party rights.

General commercial-output permissions support the intended free app and later subscriptions. They do not guarantee copyright exclusivity or clear third-party inputs, recognizable people, music, brands or copied works. No specific infringement was identified or alleged in this check.

## Change

`components/MediaAttribution.tsx` renders “Background visuals · Created with Grok” in white on a dark backing with text scaling enabled. The three screens displaying local video backgrounds (welcome, track-succeed, choose-plan) include it in their safe-area footer after the controls. No outbound link, SDK, AI service call or new user-data collection was added. The health-sync onboarding screen has no Grok video background and was not changed.

This credit does not imply provider endorsement or that Grok is integrated into the live app. Website attribution for reused media remains a separate site follow-up; website files were not changed in this app checkout.

## Verification and handoff

- `npx --no-install tsc --noEmit`: PASS. `git diff --check`: PASS.
- Native phone layout, large text and onboarding playback remain to be checked in the new build already required by SPEC-30. Test the credit remains readable and buttons accessible on all three screens. No production build was started here.
- App Store content-rights declaration remains unsubmitted. Apple includes accessed third-party content in the question, so external Learn publishers must also be considered; AI-generated media alone is not a reason to answer “no third-party content.”
