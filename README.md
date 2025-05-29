
# SynergyMattaeng (시너지맛탱)

**시너지가 미쳤다 + 조합이 맛있다 + 팀 구성에 중독된다 = 시너지맛탱!**  
**SynergyMattaeng**은 [lolchess.gg](https://lolchess.gg)와 같은 TFT 게임 사이트에서 영감을 얻은 웹 플랫폼입니다.  
"덱 구성"에 집중된 **직관적인 UI**, 다채로운 플레이를 위한 **핵심 기능**만 알차게 담은 시너지맛탱을 통해 나만의 덱을 구성하고, 공유해보세요!

---

## 👥 팀원

| 이름     | 역할             |
|----------|------------------|
| 배나연   | 프론트엔드, 기획 |
| 김예랑   | 백엔드, 기획     |

---

## ✨ 주요 기능

- **덱 구성**: 사용자가 챔피언을 선택해 자신만의 덱을 만들 수 있습니다.
- **시너지 표시**: 덱에 포함된 챔피언의 시너지를 자동으로 시각화합니다.
- **덱 게시**: 덱에 이름을 붙이고 다른 사용자들과 공유할 수 있습니다.
- **회원가입/로그인**: 사용자는 계정을 생성하고 로그인할 수 있습니다.
- **검색 기능**: 덱 목록에서 키워드 기반으로 검색할 수 있습니다.
- **추천 기능**: 다른 사용자가 작성한 덱에 '추천'을 할 수 있습니다.
- **마이페이지**: 내가 작성한 덱을 한눈에 확인할 수 있습니다.

---

## ⚙️ 기술 스택

### 🔸 Frontend
- HTML / CSS / Vanilla JavaScript
- Pretendard-Regular 웹 폰트
- JSON 데이터 처리 (champions.json, traits.json)

### 🔹 Backend
- Java 21
- Spring Boot 3.5.0
- Spring Data JPA
- Spring Security
- MySQL **8.0.42** (MySQL Community Server - GPL)
- Jackson (ObjectMapper)
- Lombok

---

## 📁 주요 디렉토리 구조

```
.
├── index.html             # 메인 페이지
├── list.html              # 덱 목록 페이지
├── mypage.html            # 마이페이지 (내 덱 확인)
├── WritePage.js           # 덱 작성 로직
├── backend/               # 백엔드 스프링 부트 서버
│   ├── src/
│   │   └── main/
│   │       ├── java/com/synergy/backend/
│   │       │   ├── controller/             # DeckController.java, UserController.java
│   │       │   ├── domain/                # Deck.java, User.java (Entity)
│   │       │   ├── repository/            # DeckRepository.java, UserRepository.java
│   │       │   └── config/                # WebSecurityConfig.java
│   │       └── resources/
│   │           └── application.properties # DB 연결 설정
│   └── build.gradle
├── components/            # 챔피언 카드, 시너지바 등 UI 컴포넌트
├── data/                  # champions.json, traits.json
├── services/              # 상태 관리 및 로컬 스토리지
├── utils/                 # 시너지 계산, 라우팅 유틸
```

---

## ▶️ 실행 방법 (백엔드 서버 실행)

```bash
cd backend
gradlew clean build
gradlew bootRun
```

> 로컬 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

---

## 🔒 기타

- 비밀번호 확인란과 비밀번호 입력이 불일치하면 경고 메시지가 출력됩니다.
- 덱 정렬 기준은 최신순 / 이름순 / 추천순 중 선택할 수 있습니다.
