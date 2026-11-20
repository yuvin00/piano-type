# Piano Type · 타자의 선율

브라우저에서 타자를 칠 때마다 곡이 이어집니다. 음색은 FluidR3_GM Acoustic Grand Piano의 88건반 MP3 샘플입니다. 출처와 라이선스는 [AUDIO-CREDITS.md](AUDIO-CREDITS.md)에 있습니다.

## 실행

브라우저 오디오 정책에 따라 첫 타이핑 또는 클릭 시 오디오가 활성화됩니다. 처음 열면 음원 디코딩 준비에 잠시 시간이 걸릴 수 있습니다. 음원은 로컬에 포함되어 인터넷 연결 없이 실행됩니다.

## 곡 선택

상단 곡 이름을 누르면 팝업이 열립니다. 곡을 바꾸면 첫 음부터 시작합니다. Esc 또는 바깥 클릭으로 닫을 수 있으며 방향키·Home·End·Enter로도 고를 수 있습니다. 마지막 음 다음에는 곡이 처음부터 반복됩니다. ‘멜로디 처음부터’로 진행을 초기화합니다. 실제 연주 속도는 타이핑 속도가 결정합니다.

징글벨, 캐논, 월광 소나타 3악장, 헝가리 무곡 5번, 왕벌의 비행, 캉캉, 터키 행진곡, 작은별, 엘리제를 위하여 — 총 9곡을 제공합니다. 캐럴 오브 더 벨스와 흑건백건은 목록에서 제외했습니다.

캐논·월광 소나타·헝가리 무곡·왕벌의 비행·터키 행진곡·엘리제를 위하여의 데이터는 [MuseTrainer MusicXML library](https://github.com/musetrainer/library)의 공개 악보에서 추출했습니다. 원본 저장소는 Public domain으로 안내합니다. 악보의 기보 순서로 진행하며 반복기호·다카포는 별도 확장하지 않았습니다. 징글벨과 작은별은 단선율 편곡이며 캉캉은 주제 선율 편곡입니다. 쉼표·음 길이는 타이핑 연주의 특성상 생략합니다.

## 사용 안내

- 한글·영문 물리 키보드와 모바일 가상 키보드 입력을 지원합니다. 붙여넣기·단축키·물리 키 길게 누르기로는 곡이 진행되지 않습니다.
- 음량 슬라이더로 소리 크기를 조절합니다. 별도의 켜기·끄기 버튼은 없습니다.
- 화면 건반도 클릭해 연주할 수 있습니다.
- 글과 선택한 곡은 현재 브라우저에 자동 저장됩니다. 외부 서버로 전송하지 않습니다.
- 모바일에서는 글쓰기 영역을 먼저 터치한 뒤 입력하세요. 한글 조합 중에도 연주하며, 조합 완료로 같은 내용이 다시 전달될 때에는 중복 연주하지 않습니다. 실제 기기·브라우저별 청음 확인은 별도로 필요합니다.

## 프로젝트 구조 (Atomic Design)

React를 설치하지 않고 JavaScript 컴포넌트를 Atomic Design 방식으로 분리했습니다. JS와 해당 컴포넌트의 CSS는 같은 폴더에 있습니다.

```text
piano-type/
├─ index.html                 # 시작 HTML, 파일 로딩 순서
├─ assets/
│  └─ audio/
│     └─ piano-samples.js     # 그랜드피아노 음색 데이터 (직접 수정할 필요 없음)
├─ src/
│  ├─ app/
│  │  ├─ main.js             # 앱 실행
│  │  └─ PianoTypeApp.js     # 화면과 서비스 연결
│  ├─ components/
│  │  ├─ atoms/             # 작은 UI 단위
│  │  │  ├─ Button.js
│  │  │  ├─ PianoKey.js
│  │  │  ├─ SongOption.js
│  │  │  └─ VolumeSlider.js
│  │  ├─ molecules/         # 작은 UI를 조합한 영역
│  │  │  ├─ PianoKeyboard.js
│  │  │  ├─ SongPicker.js
│  │  │  ├─ StudioToolbar.js
│  │  │  └─ WritingEditor.js
│  │  ├─ organisms/
│  │  │  └─ PianoStudio.js  # 툴바·글쓰기·피아노 조합
│  │  └─ layout/            # 헤더·소개 문구
│  ├─ services/
│  │  ├─ audio/GrandPiano.js       # 샘플 준비·소리 재생·음량
│  │  ├─ playback/MelodyPlayer.js # 다음 음·곡 변경·재시작
│  │  └─ storage.js               # 브라우저 저장
│  ├─ data/
│  │  ├─ songs.js           # 곡 이름·빠르기·편곡 설명
│  │  └─ scores/            # 곡별 음표 데이터 (각각 별도 파일)
│  ├─ utils/                # DOM 생성·음표 이름·키 입력 판별
│  ├─ core/namespace.js     # 컴포넌트가 공유하는 이름 공간
│  └─ styles/               # CSS 진입점·공통 스타일·전체 배치
├─ tests/project.test.cjs   # 컴포넌트 연결·연주·저장 회귀 검사
├─ AUDIO-CREDITS.md
└─ README.md
```

**수정할 곳:** 곡 선택 팝업은 `components/molecules/SongPicker.js`와 `SongPicker.css`, 글쓰기 영역은 `WritingEditor.js`와 `WritingEditor.css`, 음색 처리는 `services/audio/GrandPiano.js`에서 수정하세요. 개별 건반 모양은 `atoms/PianoKey.css`, 곡 목록은 `data/songs.js`에 있습니다. 모든 `src` 경로는 이 프로젝트 안의 경로입니다.

`index.html`을 더블 클릭해 실행하는 방법은 동일합니다. 로컬 파일 실행을 지원하도록 ES module 대신 순서가 지정된 `defer` 스크립트와 `window.PianoType` 이름 공간을 사용합니다. 새 컴포넌트 파일을 추가하면 `index.html`에서 사용하는 파일보다 앞에 연결하세요. CSS는 `src/styles/index.css`에 연결합니다.

## 기능 검사

Node.js가 설치되어 있다면 이 폴더의 VS Code 터미널에서 실행하세요.

```text
node --test tests/project.test.cjs
```

외부 테스트 패키지는 필요하지 않습니다. 검사는 간단한 DOM·오디오 모형을 이용해 파일 연결과 동작을 검증하며 실제 브라우저 렌더링·청음 검사를 대신하지는 않습니다.

## localhost:3000에서 실행

VS Code 터미널에서 프로젝트 폴더로 이동한 뒤 npm run dev를 실행하고 http://localhost:3000 에 접속하세요. 패키지 설치는 필요 없습니다. 종료는 Ctrl+C입니다. npm start도 같은 서버를 실행합니다. localhost 주소와 파일 더블 클릭 주소의 브라우저 저장소는 별개입니다.

