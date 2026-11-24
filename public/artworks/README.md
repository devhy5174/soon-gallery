# 작품 이미지 폴더

이 폴더에 이미지 파일을 넣으면 갤러리와 미디어룸에 자동으로 표시됩니다.

## 파일명 규칙 (자동 감지)

artType 이름과 동일하게 지으면 코드 수정 없이 바로 적용됩니다.

| 파일명              | 작품    |
|---------------------|---------|
| `plum.jpg`          | 홍매도  |
| `bamboo.jpg`        | 풍죽도  |
| `mountain.jpg`      | 산수도  |
| `orchid.jpg`        | 묵란도  |
| `bird.jpg`          | 조수도  |
| `chrysanthemum.jpg` | 황국도  |

## 지원 형식
`.jpg` / `.jpeg` / `.png` / `.webp` 모두 가능  
(단, 자동 감지는 `.jpg` 기준 — 다른 확장자는 `artworkData.ts`의 `imageUrl` 필드에 직접 경로 입력)

## 커스텀 파일명을 쓰고 싶을 때
`src/components/gallery/artworkData.ts`에서 해당 작품에 아래처럼 추가:
```ts
imageUrl: "/artworks/내파일명.png"
```

## 이미지 없을 때
파일이 없으면 기존 먹화 드로잉이 자동으로 표시됩니다.
