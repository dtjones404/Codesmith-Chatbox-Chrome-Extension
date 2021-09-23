// prompt user to enter their name
const room = prompt('Choose a room: ', 'codesmith');
const username = prompt('What is your name?');
const chatroom = document.querySelector('#chatroom');
const textEntry = document.querySelector('#textEntry');
const fellows = ['nisa', 'nancy', 'kat', 'kaden', 'jason', 'grisha', 'graham'];
let numberOfMessages = 0;

document.addEventListener('DOMContentLoaded', () => {
  // const title = document.createElement('h1');
  // title.innerText = 'Online Chatroom';
  // document.querySelector('body').appendChild(title);
  // make AJAX call here....
  getMessages();
  scrollDown();
});

//intiate a fetch request leveraging the URL from the readme.md on line 51
const getMessages = () => {
  fetch(`http://codesmith-chat-server.herokuapp.com:80/${room}`)
    //leverage the .then method to covert the result into a JSON
    .then((initialMessage) => initialMessage.json())
    .then((initialMessage) => {
      initialMessage
        .reverse() //reverses the array elements
        .slice(numberOfMessages) //grab the newest message
        .forEach((messageDetails) => addMessageToChatbox(messageDetails));
      if (numberOfMessages !== initialMessage.length) {
        scrollDown();
      }
      numberOfMessages = initialMessage.length;
    });
};

function addMessageToChatbox(messageDetails) {
  const createdAt = messageDetails['created_at'];
  const createdBy = messageDetails['created_by'];
  const messageText = messageDetails['message'];
  //create 1 div to hold the whole message and also one for each of the following: 'created_at', 'created_by', 'message'
  const messages = document.createElement('div');
  //add classes to each div
  messages.classList.add('messageDetails');
  //append the divs and append it to the chatroom
  const createdAtDiv = document.createElement('div');
  createdAtDiv.classList.add('createdAt');
  createdAtDiv.innerText = getPrettyTimestamp(createdAt);

  const createdByDiv = document.createElement('div');
  createdByDiv.classList.add('createdBy');
  createdByDiv.innerText = createdBy;

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('messageText');
  messageDiv.innerText = messageText;

  // if message starts with <img...
  if (typeof messageText === 'string' && messageText.slice(0, 4) === '<img') {
    // create new element
    const newImage = document.createElement('img');
    // slice string from 11th to second-to-last char (url)
    const firstQuote = messageText.indexOf("'");
    const secondQuote = messageText.indexOf("'", firstQuote + 1);
    const url = messageText.slice(firstQuote + 1, secondQuote);
    //console.log(url);

    // set src attribute
    newImage.setAttribute('src', url);
    messages.append(newImage);
  } else {
    messages.append(messageDiv);
  }
  messages.append(createdAtDiv, createdByDiv);
  chatroom.appendChild(messages);
}

document
  .getElementById('submitButton')
  .addEventListener('click', submitMessage);

document
  .getElementById('submitButton')
  .addEventListener('click', makeImageAppear);

function submitMessage() {
  let msgBox = document.getElementById('messageBox');
  let msgFromTxtBox = msgBox.value;
  msgBox.value = '';
  // create object var using two key-value pairs, createdBy and message
  const messageObj = { message: msgFromTxtBox, created_by: username };
  console.log(messageObj);
  //create post request leveraging fetch
  fetch(`http://codesmith-chat-server.herokuapp.com:80/${room}`, {
    method: 'POST',
    body: JSON.stringify(messageObj),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((submittedMsg) => submittedMsg.json())
    .then((submittedMsg) => {
      addMessageToChatbox(submittedMsg[0]);
      numberOfMessages += 1;
      scrollDown();
    });
}

function makeImageAppear() {
  if (fellows.length) {
    const portrait = document.getElementById(fellows.pop());
    portrait.style.visibility = 'visible';
  }
}

function getPrettyTimestamp(createdAt) {
  const date = new Date(createdAt);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours <= 12 ? hours : hours - 12}:${
    minutes >= 10 ? minutes : '0' + minutes
  } ${hours < 12 ? 'AM' : 'PM'}`;
}

function scrollDown() {
  let scroll = document.getElementById('chatroom');
  scroll.scrollTop = scroll.scrollHeight;
}

//auto refresh the chatroom messages every 5 seconds
setInterval(() => {
  getMessages();
}, 5000);
