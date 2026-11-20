(function (PT) {
  'use strict';
  const catalog = [
  {
    "id": "jingle",
    "title": "징글벨",
    "speed": "느림",
    "detail": "단선율 편곡"
  },
  {
    "id": "canon",
    "title": "캐논",
    "speed": "보통"
  },
  {
    "id": "moonlight",
    "title": "월광 소나타 - 3악장",
    "speed": "매우 빠름"
  },
  {
    "id": "hungarian",
    "title": "헝가리 무곡 - 5번",
    "speed": "빠름"
  },
  {
    "id": "bumblebee",
    "title": "왕벌의 비행",
    "speed": "매우 빠름"
  },
  {
    "id": "cancan",
    "title": "캉캉",
    "speed": "빠름",
    "detail": "주제 선율 편곡"
  },
  {
    "id": "turkish",
    "title": "터키 행진곡",
    "speed": "보통"
  },
  {
    "id": "twinkle",
    "title": "작은별",
    "speed": "느림",
    "detail": "단선율 편곡"
  },
  {
    "id": "elise",
    "title": "엘리제를 위하여",
    "speed": "보통"
  }
];
  PT.data.songs = catalog.map((song) => ({ ...song, notes: PT.data.scores[song.id] }));
})(window.PianoType);
