# 김 서린 유리 닦는 리듬게임 · Brand System

## Brand idea

**문질러서 맑아지는 리듬.**
화면에 설명문으로 노출하지 않고, 로고의 닦인 획·유리 재질·판정 피드백에서 반복한다.

## Wordmark and mark

- 제목은 항상 `김 서린 유리 닦는 / 리듬게임` 2행으로 사용한다.
- 두 번째 행만 Coral 채우기, Ink 외곽선, Gold 짧은 그림자를 쓴다.
- 로고 주변 장식은 닦인 곡선 1개, 반짝임 1개, 물방울 3개 이하로 제한한다.
- 앱 마크는 `public/brand-mark.svg`: 김 난 둥근 유리, 닦인 획, Gold 반짝임만 남긴다.
- 영문 별칭이나 슬로건을 추가하지 않는다.

## Core tokens

| Role | Token | Value |
|---|---|---|
| Ink | `--ink` | `#223033` |
| Cream | `--cream` | `#FFF4DA` |
| Clear glass / Good | `--clear` | `#D9F2EC` |
| Perfect | `--gold` | `#F4C95D` |
| Miss | `--coral` | `#EF7D6A` |
| Frost accent | card `--accent` | `#85C6D5` |
| Mist accent | card `--accent` | `#EF7D6A` |
| Shower accent | card `--accent` | `#69B7A6` |

한 화면의 UI는 공용 5색과 현재 스테이지 accent 1개만 쓴다. 일러스트의 세부색은 토큰으로 옮기지 않는다.

## Type

- Display: self-hosted `Jua Regular`. 로고, 스테이지명, 짧은 판정어에만 쓴다.
- UI: `Pretendard, Noto Sans KR, Apple SD Gothic Neo, sans-serif`.
- Display는 400, UI는 400/600/800만 사용한다.
- 숫자는 `font-variant-numeric: tabular-nums` 적용을 우선한다.

## Illustration language

1. 스테이지는 항상 유리 앞에 서 있는 1인칭 시점으로 구성한다: 집 안 창문, 차 안 앞유리, 세면대 앞 거울.
2. 화면 중앙 `x=150–1130, y=108–618`은 실제 interactive surface다. 원화에 김·성에·물방울·닦인 흔적을 굽지 않는다.
3. 실내 시점은 surface 밖의 근거 전경으로 설명한다: 커튼·창턱, A필러·대시보드, 타일·세면대.
4. 약간 흔들리는 Ink 색연필선, 평면 pastel, 마른 crayon/paper grain을 공통으로 쓴다.
5. 닦아야 보이는 원경은 넓은 덩어리와 낮은 대비로 그려 유리 물성과 경쟁하지 않게 한다.
6. 유리의 굴절, 성에, 물막, 물방울은 사실적인 물성을 유지한다. 이 현실적인 물성과 손그림 세계의 대비가 고유한 시각 언어다.
7. 글로시 3D, 완벽한 vector 선, 영화적 조명, 고밀도 환경 묘사는 사용하지 않는다.

## Components

- Stage card: 3px Ink border, Cream/pastel paper fill, 7×8px hard shadow, 22px radius, 약 ±0.6° tilt.
- Primary button: 최소 48px, 3px Ink border, 12px radius, 3×4px hard shadow.
- Secondary control: 최소 44px, Cream fill, 2px Ink border. Pill은 phase/status에만 쓴다.
- Locked card: 검은 overlay가 아니라 밝은 tracing-paper overlay와 점선 border를 쓴다.
- Play HUD: 4박 rail을 주연으로 두고 phase, level, prompt만 남긴다. 유리 입력을 가리지 않도록 `pointer-events: none` 상태를 보존한다.

## Rhythm feedback

| Timing | Copy | Color | Motion |
|---|---|---|---|
| Perfect | `뽀득!` | Gold | 접점에서 큰 링 260ms |
| Good | `쓱!` | Clear | 접점에서 중간 링 260ms |
| Miss | `엇박!` | Coral | 접점에서 작은 링 260ms |

왼쪽 cue가 울릴 때만 왼쪽 유리가 짧게 반사하고, 사용자 판정 후에만 오른쪽 실제 접점에 피드백을 낸다. 시각 시계를 별도로 만들지 않고 기존 AudioContext 예약 시각을 사용한다.

## Motion and accessibility

- 상시 float/parallax를 쓰지 않는다. 눈, 비, 수증기만 스테이지당 7–11개 이하로 움직인다.
- respond 중에는 카메라·배경·유리를 움지이지 않는다.
- 모든 touch target은 44×44px 이상이다.
- `prefers-reduced-motion` 시 ambient 속도를 낮추고 transform transition을 즉시 종료한다. 박자 flash와 색상 피드백은 유지한다.
- 판정 색상은 문구와 형태를 항상 함께 사용한다.
