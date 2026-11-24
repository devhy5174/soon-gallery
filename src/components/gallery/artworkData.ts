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
];
