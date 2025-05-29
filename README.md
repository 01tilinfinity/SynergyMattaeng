# SynergyMattaeng (시너지맛탱)

시너지가 미쳤다 + 조합이 맛있다 + 팀 구성에 중독된다 = 시너지맛탱!
<br/> **SynergyMattaeng**은 lolchess.gg와 같은 TFT 게임 사이트에서 영감을 얻은 웹 플랫폼입니다.
<br/> "덱 구성"에 집중된 **직관적인 UI**, 다채로운 플레이를 위한 **핵심 기능**만 알차게 담은 시너지맛탱을 통해 나만의 덱을 구성하고, 공유해보세요!

## 팀원
- 배나연 : 프론트엔드 및 기획
- 김예랑 : 백엔드 및 기획 

## 주요 기능
- **덱 구성**: 사용자가 자신만의 덱을 구성할 수 있습니다.
- **시너지 표시**: 덱 구성에 따라 시너지를 자동으로 표시합니다.
- **덱 게시**: 덱에 이름을 붙여 다른 유저들에게 게시할 수 있습니다.
- **회원가입/로그인**: 사용자 등록과 로그인을 지원합니다.
- **검색**: 다른 사용자가 게시한 덱을 검색할 수 있습니다.

## 사용 스택
- **백엔드**: Spring
- **프론트엔드**: JavaScript (Vanilla JS)
- **데이터베이스**: MySQL

## 레퍼런스
![image](https://github.com/user-attachments/assets/19960529-e364-41e2-9672-536dd58d79e9)
![image](https://github.com/user-attachments/assets/fec82ba4-595f-43af-a271-75770d95cd67)

## 구현 진행상황(5/26)
- 덱 구성 페이지 프론트엔드 기능 구현 완료
  - 마우스 오버(호버) 시 챔피언 특성 오버레이
  - 선택된 챔피언 고화질 이미지로 교체 및 코스트 오름차순 -> 이름 오름차순 정렬
  - 반응형 디자인 적용
  - 시너지바, 챔피언 목록 정렬 및 디자인 보완
    ![image](https://github.com/user-attachments/assets/9211cbc1-74e0-412e-a43c-b091c910c55e)
    ![image](https://github.com/user-attachments/assets/d8b3f60f-970a-4332-8de8-575806a3da15)

- 백엔드 프레임워크 Node.js -> springboot로 변경
- 백엔드 회원가입/로그인 기능 구현 완료, DB 연동 완료
  ![image (20)](https://github.com/user-attachments/assets/9558c7cd-6217-4453-b31c-a63ed152cee3)
  ![image (21)](https://github.com/user-attachments/assets/3dc843b6-be0b-4bb0-b3be-5a98fd160907)

## 진행 계획
- 선택된 챔피언 호버 시 챔피언 스킬, 3신기 오버레이 구현
- 챔피언 후보 목록 이름순, 가격순, 특성별 정렬 기능 추가
- 회원가입/로그인 프론트 작업
- 백엔드 글 관련 DB - 백엔드 연동
- 글 작성 API 개발

