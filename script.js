// index.html을 열어서 agoraStatesDiscussions 배열 요소를 확인하세요.
console.log(agoraStatesDiscussions);

// 하드코딩된 부분 구현
let data
const dataFromLocalStorage = localStorage.getItem("agoraStatesDiscussions")
if(dataFromLocalStorage) {
  data = JSON.parse(dataFromLocalStorage)
} else {
  data = agoraStatesDiscussions.slice()
}

// convertToDiscussion은 아고라 스테이츠 데이터를 DOM으로 바꿔줍니다.
const convertToDiscussion = (obj) => {
  const li = document.createElement("li"); // li 요소 생성
  li.className = "discussion__container"; // 클래스 이름 지정

  const avatarWrapper = document.createElement("div");
  avatarWrapper.className = "discussion__avatar--wrapper";
  const discussionContent = document.createElement("div");
  discussionContent.className = "discussion__content";
  const discussionAnswered = document.createElement("div");
  discussionAnswered.className = "discussion__answered";

  // TODO: 객체 하나에 담긴 정보를 DOM에 적절히 넣어주세요. 
  // img
  const avatarImg = document.createElement("img");
  avatarImg.className = 'discussion__avatar--image'
  avatarImg.src = obj.avatarUrl
  avatarImg.alt = 'avartar of ' + obj.author
  avatarWrapper.append(avatarImg)
  
  // 시간 표현 
  const formatDate = new Date(obj.createdAt).toLocaleString('ko-KR', { timeZone: 'UTC' });
  // discussion info
  const discussionTitle = document.createElement("h2")
  const discussionLink = document.createElement("a")
  discussionLink.href = obj.url
  discussionLink.textContent = `${obj.title}`
  discussionTitle.append(discussionLink)
  const discussionInfo = document.createElement('div')
  discussionInfo.className = 'discussion__information'
  discussionInfo.textContent = `${obj.author} / ${formatDate}`
  discussionContent.append(discussionTitle)
  discussionContent.append(discussionInfo)

  // answered
  const discussionAns = document.createElement('div')
  discussionAns.textContent = obj.answer ? "✅" : "❌"
  discussionAnswered.append(discussionAns)

  // answer toggle 
  const discussionAnsContent = document.createElement('div')
  discussionAnsContent.className = 'discussion__answered--contents'
  // discussionAnsContent.textContent = obj.answer ? obj.answer.bodyHTML : '';
  // discussionAnswered.append(discussionAnsContent)

  // 문자열을 DOM으로 변환.
  if(obj.answer) {
  const parsedHTML = new DOMParser().parseFromString(obj.answer.bodyHTML, 'text/html')
  for (const child of parsedHTML.body.childNodes) {
    discussionAnsContent.appendChild(child.cloneNode(true));
  }
  discussionAnswered.appendChild(discussionAnsContent);
  }

  // click toggle event
  li.addEventListener('click', (e) => {
    e.preventDefault()
    li.classList.toggle("active")
    li.scrollIntoView({ behavior: "smooth", block: "center"})
  })


  li.append(avatarWrapper, discussionContent, discussionAnswered);
  return li;
};
// agoraStatesDiscussions 배열의 모든 데이터를 화면에 렌더링하는 함수입니다.
const render = (element, from, to) => {
  // for (let i = 0; i < agoraStatesDiscussions.length; i += 1) {
  //   element.append(convertToDiscussion(agoraStatesDiscussions[i]));
  // }
  // return;
  if(!from && !to) {
    from = 0
    to = data.length - 1
  }
  // 기존의 내용 다 지우고 배열에 있는 내용 다 보여주기 --> 새로운 데이터를 표시하기 위한 준비 과정
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
  for (let i = from; i < to; i += 1) {
    element.append(convertToDiscussion(data[i]))
  }
  return;
};
// 페이지네이션을 위한 변수
let limit = 10
  page = 1;

// ul 요소에 agoraStatesDiscussions 배열의 모든 데이터를 화면에 렌더링합니다.
const ul = document.querySelector("ul.discussions__container");
render(ul, 0, limit);

// 페이지네이션 기능 구현
const getPageStartEnd = (limit, page) => {
  const len = data.length - 1;
  let pageStart = Number(page - 1) * Number(limit) // 해당 페이지의 첫번째 요소 인덱스
  let pageEnd = Number(pageStart) + Number(limit); // 해당 페이지의 마지막 요소 인덱스
  if(page <= 0) {
    pageStart = 0;
  }
  if(pageEnd >= len) {
    pageEnd = len
  }
  return { pageStart, pageEnd }
}
const buttons = document.querySelector(".buttons")
buttons.children[0].addEventListener("click", () => {
  if(page > 1) {
    page = page - 1 
  }
  const { pageStart, pageEnd } = getPageStartEnd(limit, page);
  render(ul, pageStart, pageEnd)
})
buttons.children[1].addEventListener("click", () => {
  if (limit * page < data.length - 1) {
    page = page + 1;
  }
  const { pageStart, pageEnd } = getPageStartEnd(limit, page);
  render(ul, pageStart, pageEnd);
});

// form
const form = document.querySelector('.form');
const nameInput = document.querySelector('#name');
const titleInput = document.querySelector('#title');
const storyInput = document.querySelector('#story');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const newDiscussion = {
    author: nameInput.value,
    title: titleInput.value,
    bodyHTML: storyInput.value,
    avatarUrl: "https://avatars.githubusercontent.com/u/129926357?s=400&u=510f31940547e71fa8d3e5567d609148b8f9bb26&v=4",
    answer: null,
    createdAt: new Date()
  }

  // 서버 연결 x
  data.unshift(newDiscussion)
  localStorage.setItem("agoraStatesDiscussions", JSON.stringify(data))
  render(ul, 0, limit)

  // 서버 연결
  fetch(`http://localhost:4000/discussions`, {
    method: 'POST',
    body: JSON.stringify(newDiscussion),
    headers: { 'Content-Type' : 'application/json' }
  })
  .then(res => res.json())
  .then(res => {
    console.log(res)
    data.unshift(res)

    localStorage.setItem("agoraStatesDiscussions", JSON.stringify(data))
    render(ul, 0, limit)
  })
  .catch(err => {
    console,log("Error: ", err)
  })
  
  titleInput.value = '';
  storyInput.value = '';
})

// 서버와 연결하기
fetch("http://localhost:4000/discussions")
  .then(res => res.json())
  .then(res => {
    data = res;
    localStorage.setItem("agoraStatesDiscussions", JSON.stringify(data))
  })
  .catch(err => {
    console.log('Error: ', err)
  })