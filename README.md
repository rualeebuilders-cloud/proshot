# ProShot — AI 1인 기업 해부 실습 (EP.02)

이 프로젝트는 네덜란드 출신의 1인 개발자 대니 포스트마(Danny Postma)의 성공 모델인 **HeadshotPro**의 원리와 비즈니스 구조를 직접 학습하기 위해 구축한 미니 프로필 이미지 생성 서비스, **ProShot**입니다.

## 🚀 주요 기능
1. **셀카 업로드 & 미리보기**: 브라우저 내에서 직접 원본 이미지 파일을 업로드하고 미리볼 수 있습니다. (최대 8MB 제한)
2. **스타일 선택**: 비즈니스 정장, 스튜디오, 야외 자연광 중 하나의 테마를 선택할 수 있습니다.
3. **AI 프로필 생성**: fal.ai의 `flux-pulid` 모델을 활용하여, 인공지능이 얼굴을 유지한 채 스타일을 완성해 줍니다.
4. **Before / After 비교 & PNG 다운로드**: 원본과 결과물을 한눈에 보고 고화질 파일로 내보낼 수 있습니다.
5. **원가 차단 및 BYOK(내 키 입력) 모드**:
   - 데모 이용자별로 2회 생성 한도 제한을 브라우저 로컬 스토리지로 통제합니다.
   - 한도를 초과하면 본인의 `fal.ai` 키를 등록(BYOK)하여 개인 서버 비용 부담 없이 서비스를 영구 이용할 수 있습니다.

---

## 🛠️ 로컬 개발 환경 셋업

### 1. 패키지 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
1. 프로젝트 루트에 `.env.local` 파일을 생성합니다.
2. [fal.ai](https://fal.ai) 대시보드에 가입/로그인한 뒤, **Dashboard > Keys**에서 API 키를 생성하고 복사합니다.
3. `.env.local`에 다음과 같이 입력하고 저장합니다.
```env
FAL_KEY=생성한_FAL_KEY_값
```
*주의: `.env.local`은 절대 Git에 커밋되지 않도록 `.gitignore`에 등록되어 있는지 확인하십시오.*

### 3. 로컬 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 정상 동작 여부를 확인합니다.

---

## ☁️ Vercel에 배포하는 방법

### 1. Git 리포지토리 초기화 및 커밋
로컬 프로젝트에 Git이 연동되어 있지 않다면 초기화하고 코드를 커밋합니다.
```bash
git init
git add .
git commit -m "feat: init ProShot project"
```

### 2. GitHub 리포지토리 푸시
GitHub에 새 비공개(Private) 또는 공개(Public) 리포지토리를 만들고 원격 주소를 등록한 뒤 코드를 푸시합니다.
```bash
git remote add origin https://github.com/사용자이름/저장소이름.git
git branch -M main
git push -u origin main
```

### 3. Vercel 배포 진행
1. [vercel.com](https://vercel.com)에 로그인합니다.
2. **Add New > Project**를 클릭하고 방금 생성한 GitHub 저장소를 Import합니다.
3. **Environment Variables** (환경 변수) 설정 항목을 펼칩니다.
4. Name에 `FAL_KEY`, Value에 본인의 fal.ai API 키 값을 입력하고 **Add**를 누릅니다.
5. **Deploy** 버튼을 클릭하여 빌드를 시작합니다.
6. 완료되면 생성되는 `https://*.vercel.app` 주소를 통해 온라인에서 누구나 데모를 이용할 수 있습니다.

*팁: Vercel의 Serverless Functions 기본 타임아웃은 무료(Hobby) 플랜의 경우 10초(Next.js App Router 15+는 최대 60초까지 지원 가능)입니다. 이미지 생성은 보통 15초~30초 소요되므로 Vercel 서버에서 타임아웃이 나지 않도록 `route.ts`에 `maxDuration = 60` 설정을 미리 완료해 두었습니다.*
