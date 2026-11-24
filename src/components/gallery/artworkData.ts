/**
 * artworkData
 * 갤러리 작품 목록 — 3D 배치 좌표 + 모달 표시 메타데이터
 * Supabase 연동 전까지 사용하는 임시 데이터
 */

import type { ArtType } from "./artDrawings";

export interface ArtworkData {
  /** 고유 ID — 레이캐스트 userData 식별에 사용 */
  id: string;
  title: string;
  titleEn: string;
  description: string;
  artType: ArtType;
  /**
   * 이미지 파일 경로 (선택)
   * - 설정하면 해당 파일을 우선 사용
   * - 미설정 시 /artworks/{artType}.jpg 자동 탐색 → 없으면 먹화 드로잉 폴백
   */
  imageUrl?: string;
}

export const ARTWORK_LIST: ArtworkData[] = [
  {
    id: "left-7",
    title: "홍매도",
    titleEn: "Red Plum Blossom",
    description:
      "이른 봄, 눈 속에서 고고히 피어나는 홍매의 아름다움을 담았습니다. 차가운 겨울을 이겨내고 가장 먼저 꽃을 피우는 매화는 군자의 절개와 굳은 의지를 상징합니다.",
    artType: "plum",
  },
  {
    id: "left-1",
    title: "풍죽도",
    titleEn: "Bamboo in the Wind",
    description:
      "바람에 휘어지면서도 꺾이지 않는 대나무의 강인함을 묵화로 표현했습니다. 굳건하면서도 유연한 군자의 기상을 담고 있습니다.",
    artType: "bamboo",
  },
  {
    id: "left-n5",
    title: "산수도",
    titleEn: "Mountain Landscape",
    description:
      "운무가 감도는 산과 계곡의 정경을 담은 묵화입니다. 여백의 미를 살려 보는 이로 하여금 자연의 고요함 속에서 그 숨결을 느끼게 합니다.",
    artType: "mountain",
  },
  {
    id: "right-7",
    title: "묵란도",
    titleEn: "Orchid in Ink",
    description:
      "은은한 향기를 품은 난초의 우아함을 묵화로 담았습니다. 사군자 중 하나인 난초는 고귀한 품성과 청아한 절개를 상징합니다.",
    artType: "orchid",
  },
  {
    id: "right-1",
    title: "조수도",
    titleEn: "Birds on a Branch",
    description:
      "고요한 가지 위에서 쉬고 있는 새 두 마리의 모습을 간결한 필선으로 포착했습니다. 자연과 생명의 조화로운 순간을 담은 작품입니다.",
    artType: "bird",
  },
  {
    id: "right-n5",
    title: "황국도",
    titleEn: "Chrysanthemum",
    description:
      "늦가을 서리를 견디며 피어나는 국화의 기품을 표현했습니다. 사군자 중 하나로, 절개와 지조를 상징하는 선비의 꽃입니다.",
    artType: "chrysanthemum",
  },
  {
    id: "back-main",
    title: "산수화",
    titleEn: "Mountain Landscape",
    description:
      "운무가 감도는 웅장한 산세와 계곡의 정경을 담은 대형 묵화입니다. 넓은 여백 속에서 자연의 광대함과 고요함을 느낄 수 있는 전시관의 대표 작품입니다.",
    artType: "mountain",
  },
  {
    id: "back-left-1",
    title: "연화도",
    titleEn: "Lotus Flower",
    description:
      "진흙 속에서도 고결하게 피어나는 연꽃을 담았습니다. 불교에서 청정과 깨달음을 상징하며, 세속에 물들지 않는 군자의 덕목을 표현합니다.",
    artType: "lotus",
  },
  {
    id: "front-1",
    title: "어락도",
    titleEn: "Carp in Water",
    description:
      "물속을 유유히 노니는 잉어를 담았습니다. 잉어는 출세와 등용을 상징하며, 물결 위를 힘차게 뛰어오르는 모습은 역경을 극복하는 기상을 나타냅니다.",
    artType: "carp",
  },
  {
    id: "front-2",
    title: "맹호도",
    titleEn: "Tiger",
    description:
      "백수의 왕 호랑이를 힘차게 표현했습니다. 용맹과 위엄의 상징인 호랑이는 나쁜 기운을 물리치고 집안을 지켜주는 수호의 의미를 담고 있습니다.",
    artType: "tiger",
  },
  {
    id: "front-3",
    title: "쌍학도",
    titleEn: "Two Cranes",
    description:
      "소나무 가지 위에 깃든 학의 우아한 자태를 표현했습니다. 학은 장수와 고결함을 상징하며, 소나무와 함께 불로장생의 염원을 담은 길상의 작품입니다.",
    artType: "crane",
  },
  {
    id: "back-right-1",
    title: "모란도",
    titleEn: "Peony",
    description:
      "꽃 중의 왕이라 불리는 모란을 화려하면서도 품위 있게 표현했습니다. 부귀와 번영을 상징하는 모란은 경사스러운 자리를 빛내는 꽃입니다.",
    artType: "peony",
  },
];
