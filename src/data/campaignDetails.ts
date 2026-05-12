export interface CampaignDetailSection {
  title: string;
  body: string;
  bullets: string[];
}

export interface CampaignDetail {
  id: string;
  page: string;
  title: string;
  country: string;
  region: string;
  documentType: "제안서" | "결과보고서";
  status: "모금중" | "완료";
  category: "식수위생" | "학교건축";
  visual: "water" | "school";
  summary: string;
  sourceDocument: string;
  targetLabel: string;
  raisedLabel: string;
  progress: number;
  stats: Array<{ label: string; value: string }>;
  highlights: string[];
  sections: CampaignDetailSection[];
  evidenceNotes: string[];
}

export const campaignDetails: CampaignDetail[] = [
  {
    id: "gn-chad-water-2026",
    page: "campaign-chad-water.html",
    title: "차드 식수위생지원사업",
    country: "차드",
    region: "은자메나 인근 4개 CDP",
    documentType: "제안서",
    status: "모금중",
    category: "식수위생",
    visual: "water",
    summary:
      "수도 은자메나 인근 4개 CDP 지역에 안전한 식수시설과 위생 인프라를 연결해 주민과 아동의 건강, 교육환경, 지역사회 관리 역량을 함께 개선하는 프로젝트입니다.",
    sourceDocument: "[굿네이버스] 차드 식수위생지원사업 제안서.pdf",
    targetLabel: "목표 58,000,000원",
    raisedLabel: "21,460,000원 모금",
    progress: 37,
    stats: [
      { label: "직접 수혜", value: "4,053명" },
      { label: "간접 수혜", value: "92,430명" },
      { label: "총 수혜", value: "96,483명" },
      { label: "예상 기간", value: "모금 완료 후 6개월" },
    ],
    highlights: [
      "Kakam, Makodo, Farcha Attere, Apagk 4개 CDP 대상",
      "신규 식수펌프 9개 설치",
      "Kakam 지역 Kaliwa 중학교 물탱크 및 태양광 시스템 보수",
      "11개 지역 위생 캠페인과 위생용품 제공",
    ],
    sections: [
      {
        title: "왜 필요한가요",
        body:
          "해당 지역은 건기에는 물이 말라 하나의 펌프에 많은 주민이 몰리고, 우기에는 오염수와 빗물이 섞여 수인성 질병 위험이 커지는 취약지역입니다. 학교 위생시설도 파손되어 아이들이 안전하게 수업받기 어렵습니다.",
        bullets: [
          "오염된 물 의존으로 설사, 콜레라 등 수인성 질병 노출",
          "빈곤으로 식수 구매나 고장난 펌프 수리 여력 부족",
          "학교 화장실과 손씻기 시설 부족으로 아동 건강 위협",
          "시설 유지관리 주체가 없어 고장 후 방치되는 문제",
        ],
      },
      {
        title: "무엇을 지원하나요",
        body:
          "마을 단위에는 관리가 쉬운 수동 식수펌프를 설치하고, 학생과 교직원이 집중적으로 물을 사용하는 학교에는 2,000L 물탱크와 태양광 시스템을 보수하는 구조입니다.",
        bullets: [
          "4개 CDP 9개 지역 식수펌프 설치",
          "Kaliwa 중학교 물탱크, 태양광 시스템, 화장실 보수",
          "정화조 비우기, 파이프 교체, 균열 보수 등 위생시설 정비",
          "위생위원회 구성, 주민 교육, 비누와 세제 등 위생용품 제공",
        ],
      },
      {
        title: "어떻게 검증하나요",
        body:
          "제안서에는 사전조사, 시추, 펌핑 및 회복 테스트, 수질검사, 사후 모니터링까지 포함되어 있습니다. Truve에서는 이 프로젝트 ID를 Payment Memo와 Evidence Package에 연결할 수 있습니다.",
        bullets: [
          "수리지질 및 지구물리학적 조사로 시추 부지 선정",
          "펌핑 및 회복 테스트로 물 공급 안정성 확인",
          "WHO 기준에 따른 안전한 식수 여부 점검",
          "프로젝트 매니저 상주 및 정기 모니터링",
        ],
      },
    ],
    evidenceNotes: [
      "Campaign Memo: gn-chad-water-2026",
      "Evidence Package에 사업지역, 수혜자, 모금률, 결제 TX를 연결",
      "모금 완료 후 집행 및 보고 단계에서 결과보고서 Proof Link 확장 가능",
    ],
  },
  {
    id: "gn-ethiopia-school-2026",
    page: "campaign-ethiopia-school.html",
    title: "에티오피아 학교건축사업",
    country: "에티오피아",
    region: "티그라이 지역",
    documentType: "제안서",
    status: "모금중",
    category: "학교건축",
    visual: "school",
    summary:
      "내전과 가뭄으로 교육 인프라가 크게 훼손된 티그라이 지역 아동에게 안전한 학습공간을 복구하고 교육 접근성을 회복하기 위한 학교건축 프로젝트입니다.",
    sourceDocument: "[굿네이버스] 에티오피아 학교건축사업 제안서.pdf",
    targetLabel: "목표 100,000,000원",
    raisedLabel: "34,000,000원 모금",
    progress: 34,
    stats: [
      { label: "사업 지역", value: "티그라이" },
      { label: "핵심 목적", value: "교육 접근성 회복" },
      { label: "현재 모금률", value: "34%" },
      { label: "지원 범위", value: "학교 인프라 복구" },
    ],
    highlights: [
      "내전 피해 지역 아동의 학습권 회복",
      "신규 교실, 교무실, 화장실, 식수시설 중심 복구안",
      "교육 기자재와 교사 역량 강화 연계 가능",
      "완공 이후 급식지원 등 후속 사업 확장 가능",
    ],
    sections: [
      {
        title: "왜 필요한가요",
        body:
          "티그라이 지역은 2020년 이후 내전으로 학교와 병원 등 사회기반시설이 대규모로 파괴되었고, 교육 중단으로 많은 아동이 학습권을 잃은 상황입니다.",
        bullets: [
          "학교와 병원 등 사회기반시설의 80% 이상 파괴된 것으로 제안서에 설명",
          "약 240만 명 아동이 장기간 학교에 다니지 못한 학습 위기",
          "88% 교실, 96% 책상, 95% 칠판 파괴 등 교육환경 손상",
          "식량 불안정과 조혼, 아동노동 증가로 중도탈락 위험 확대",
        ],
      },
      {
        title: "무엇을 지원하나요",
        body:
          "제안서는 안전성과 내구성을 확보한 표준화된 학교건축 방식을 전제로, 교실과 부대시설을 복구해 아이들이 다시 출석하고 머물 수 있는 공간을 만드는 데 초점을 둡니다.",
        bullets: [
          "신규 교실 및 교무실 등 기본 학습공간 조성",
          "화장실과 식수시설을 포함한 학교 생활 인프라 보강",
          "교육 기자재 지원 및 교사 역량강화 교육 연계",
          "건축 표준과 정부 안전기준 기반 시공",
        ],
      },
      {
        title: "기대 변화",
        body:
          "학교는 단순한 건물이 아니라 출석률 회복, 중도탈락 예방, 심리적 안정, 급식 등 후속 교육 프로그램이 작동할 수 있는 기반입니다.",
        bullets: [
          "아이들이 조혼과 아동노동 대신 학교로 돌아올 수 있는 환경 조성",
          "안전한 교실을 통한 학습권 회복",
          "완공 후 급식지원 등 교육지원 프로그램 연결 가능",
          "장기적으로 지역사회 회복과 아동권리 보호에 기여",
        ],
      },
    ],
    evidenceNotes: [
      "Campaign Memo: gn-ethiopia-school-2026",
      "제안서 기반으로 목표금액, 사업지역, 지원 범위, 모금률을 Evidence에 연결",
      "완공 후 결과보고서가 추가되면 Credential 검증 데이터로 확장 가능",
    ],
  },
  {
    id: "gn-rwanda-school-report-2025",
    page: "campaign-rwanda-school.html",
    title: "르완다 학교건축사업",
    country: "르완다",
    region: "Kamonyi 지역 Ngoma CDP, EP Magu 초등학교",
    documentType: "결과보고서",
    status: "완료",
    category: "학교건축",
    visual: "school",
    summary:
      "EP Magu 초등학교에 안전한 학습환경을 조성하기 위해 교실 5개동과 관련 시설을 구축한 완료형 프로젝트입니다. 결과보고서 기반으로 사업성과를 상세 확인할 수 있습니다.",
    sourceDocument: "[굿네이버스] 르완다 학교건축사업 결과보고서.pdf",
    targetLabel: "사업비 95,000,000원",
    raisedLabel: "결과보고 공개",
    progress: 100,
    stats: [
      { label: "직접 수혜", value: "약 230명" },
      { label: "간접 수혜", value: "재학생 1,629명" },
      { label: "사업 기간", value: "2025.07 - 2026.03" },
      { label: "결산", value: "USD 70,370" },
    ],
    highlights: [
      "EP Magu 초등학교 교실 5개동 건축",
      "약 50년 이상 사용 가능하도록 내구성 높은 자재 적용",
      "빗물집수 시스템 등 학습환경 개선 시설 포함",
      "과밀학급 문제 약 31% 감소",
    ],
    sections: [
      {
        title: "사업 배경",
        body:
          "Kamonyi 지구는 르완다 남부의 농촌 중심 지역으로 교육 인프라가 충분하지 않고, 우기에는 학교 시설이 기후 영향을 크게 받는 환경입니다. EP Magu 초등학교는 노후화된 교육시설과 열악한 환경으로 안정적인 학습이 어려웠습니다.",
        bullets: [
          "비가 오면 지붕 누수와 바닥 파손으로 수업 지속이 어려운 환경",
          "교실 부족으로 과밀학급 문제가 심각",
          "노후 시설로 아동 안전사고 위험 존재",
          "지역 전체 재학생 1,629명에게 영향을 미치는 핵심 교육시설",
        ],
      },
      {
        title: "완료된 지원",
        body:
          "결과보고서에 따르면 기초공사, 벽체, 지붕 및 천장, 문과 창호, 벽 마감, 도장과 외부 마감까지 전 공정을 진행해 장기 사용 가능한 교실을 조성했습니다.",
        bullets: [
          "교실 5개동 건축",
          "빗물집수 시스템 구축",
          "학습 기자재 및 학교 환경 개선 지원",
          "내구성 높은 자재로 장기 유지보수 부담 완화",
        ],
      },
      {
        title: "사업 성과",
        body:
          "지원 이후 아이들은 안전하고 쾌적한 교실에서 수업받을 수 있게 되었고, 과밀학급 문제와 교사 1인당 학생 수 비율이 개선되었습니다.",
        bullets: [
          "직접 이용 학생 약 230명 수혜",
          "전체 재학생 1,629명에게 간접 효과",
          "과밀학급 문제 약 31% 감소",
          "학업 성취도 향상에 긍정적 영향 기대",
        ],
      },
    ],
    evidenceNotes: [
      "Campaign Memo: gn-rwanda-school-report-2025",
      "결과보고서 기반으로 사업비, 기간, 수혜자, 완료 내역을 Proof Link로 제공",
      "완료형 프로젝트이므로 Evidence Package 샘플 및 검증 페이지에 연결하기 적합",
    ],
  },
  {
    id: "gn-malawi-water-report-2024",
    page: "campaign-malawi-water.html",
    title: "말라위 식수위생지원사업",
    country: "말라위",
    region: "Kawale Village",
    documentType: "결과보고서",
    status: "완료",
    category: "식수위생",
    visual: "water",
    summary:
      "식수로 어려움을 겪던 말라위 지역 주민에게 안전한 물 접근성을 제공하기 위해 식수시설을 구축하고 위생 인식 개선을 연결한 완료형 프로젝트입니다.",
    sourceDocument: "[굿네이버스] 말라위 식수위생지원사업 결과보고.pdf",
    targetLabel: "사업비 7,997,100원",
    raisedLabel: "Proof Link Ready",
    progress: 100,
    stats: [
      { label: "사업비", value: "USD 5,795" },
      { label: "원화 기준", value: "7,997,100원" },
      { label: "사업 기간", value: "2024.05 - 2025.04" },
      { label: "주요 지역", value: "Kawale Village" },
    ],
    highlights: [
      "신규 식수시설 구축",
      "55-65m 수준의 지하수 개발 및 펌프 설치",
      "주민 대상 위생교육 및 관리 인식 개선",
      "결과보고 기반 증빙 샘플로 활용 가능",
    ],
    sections: [
      {
        title: "사업 배경",
        body:
          "말라위는 경제적 취약성과 기후, 보건 문제로 기본 생활환경 개선이 중요한 지역입니다. 결과보고서는 식수 접근성 문제를 겪던 지역에 안전한 물 공급 기반을 마련한 과정을 담고 있습니다.",
        bullets: [
          "안전한 식수 접근성 부족",
          "식수 확보를 위한 이동 부담과 생활 불편",
          "수질 문제로 인한 건강 위험",
          "지역 주민이 지속적으로 관리할 수 있는 시설 필요",
        ],
      },
      {
        title: "완료된 지원",
        body:
          "보고서에는 시추와 식수시설 구축, 관련 교육 및 현판 설치 등 후원금이 실제 현장 시설로 연결된 내역이 포함되어 있습니다.",
        bullets: [
          "식수시설 시추 및 펌프 설치",
          "주민 대상 위생 및 시설관리 교육",
          "사업 현장 안내판 설치",
          "사업 착수부터 최종 마무리까지 결과보고 공개",
        ],
      },
      {
        title: "사업 성과",
        body:
          "완료된 식수시설은 주민들이 오염된 물에 의존하지 않고 가까운 곳에서 안전한 물을 이용할 수 있도록 돕는 기반입니다.",
        bullets: [
          "안전한 물 접근성 향상",
          "식수 확보 시간과 이동 부담 감소",
          "위생 인식 개선을 통한 질병 예방 기대",
          "결과보고 기반으로 투명한 기부 증빙 제공 가능",
        ],
      },
    ],
    evidenceNotes: [
      "Campaign Memo: gn-malawi-water-report-2024",
      "결과보고서 기반으로 사업비, 기간, 지역, 완료 내역을 Evidence에 연결",
      "완료형 식수위생 프로젝트의 Proof Link 샘플로 활용 가능",
    ],
  },
];

export function getCampaignDetailById(id: string | null): CampaignDetail | null {
  if (!id) return null;
  return campaignDetails.find((campaign) => campaign.id === id) ?? null;
}

export function getCampaignDetailByPage(page: string): CampaignDetail | null {
  const normalized = page.split("/").pop() ?? page;
  return campaignDetails.find((campaign) => campaign.page === normalized) ?? null;
}

export function getCampaignDetailHref(id: string): string {
  return getCampaignDetailById(id)?.page ?? "foundation-info.html";
}
