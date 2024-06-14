import fireBaseSetup from './firebase-setup.js';
import fns from './utils.js';
let { db, get, set, ref, auth, child, onValue } = fireBaseSetup;
let { goTo, showError, closeError, loading, hideLoading, dateString, timeString } = fns;
let id = location.search.split("=")[1];
let messageContainer = document.querySelector(".messages");
let userId = localStorage.getItem("userId");
let conversation;
let otherUser;
let date="00/00/00";
let msgForm = document.querySelector("form.input");
let url;
msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addMessage();
})


document.querySelector(".back").addEventListener("click", () => { goTo("./index.html") });
document.querySelector("#image-selection").addEventListener("click", chooseImage);
document.querySelector(".preview button").addEventListener("click", addImage);
getConversation();
checkForUpdates();

function getConversation() {
  loading();
  get(child(ref(db), "conversations/" + id))
    .then(snapshot => {
      if (snapshot.val()) {
        conversation = snapshot.val();
        otherUser = Object.values(conversation.users)[0].id == userId ? Object.values(conversation.users)[1] : Object.values(conversation.users)[0];
        setTopBar();
        fetchMessages();
        onMessage();
        hideLoading();
      }
    })
    .catch(err => {
      console.log(err);
      hideLoading();
      showError("Something went wrong!!!");
    })
}
function setTopBar() {
  document.querySelector(".top-bar .conversation").innerHTML = `<div class="profile-image">
        <img load="lazy" src="${otherUser.profilePic}">
      </div>
      <div class="detail">
        <h3 class="name">${otherUser.name}</h3>
        <p>Not active</p>
      </div>`;
}
function fetchMessages() {
  messageContainer.innerHTML = conversation.messages.map(message => {
    let putDate = true;
    if (date == message.date) {
      putDate = false;
    }

    date = message.date;
    return `${putDate ? "<div class='date'>" + message.date + "</div>" : ""} 
        <div class="message ${message.id == userId ? "me" : ""}">
       <div class="row">
         <div class="profile-image">
          <img load="lazy" src="${conversation.users[message.id].profilePic}">
        </div>
         <div class="box ${message.type}">${message.message}</div>
       </div>
       <div class="time">${message.time}</div>
    </div>`;
  }).join("");
  window.scrollTo(0, parseFloat(getComputedStyle(messageContainer).getPropertyValue("height")));
}
function addMessage() {

  let msg = document.getElementById("msg").value;
  if (msg == "") {
    showError("Please type something to send");
    return;
  }
  let messageObj = { id: userId, message: msg,type:"text", date: dateString(new Date()), time: timeString(new Date()) }
  conversation.messages.push(messageObj);
  fetchMessages();
  document.getElementById("msg").value = "";
  set(ref(db, "conversations/" + id + "/messages/" + conversation.messages.length), messageObj).then().catch(err => {
    showError("Something went wrong!!!");
    console.log(err);
  })
}

function minifyConversations(conversations) {
  let minifiedConversations = {};
  Object.entries(conversations).forEach(([key, conversation], index) => {

    let users = Object.values(conversation.users);
    let otherUser = users[0].id === userId ? users[1] : users[0];
    minifiedConversations[key] = {
      id: conversation.id,
      otherUser
    };
  });
  return minifiedConversations;
}

function checkForUpdates() {
  let conversationsRef = ref(db, `users/${userId}/conversations`);
  onValue(conversationsRef, (snapshot) => {
    let updatedConv = snapshot.val();
    let minifiedConversations = minifyConversations(updatedConv);
    sessionStorage.setItem("conversations", JSON.stringify(minifiedConversations));
  }, (err) => {
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });
}

function onMessage() {
  let messageRef = ref(db, "conversations/" + id + "/messages/");
  onValue(messageRef, (snapshot) => {
    let messages = snapshot.val();
    if (messages.length == conversation.messages.length) {
    } else {
      conversation.messages = messages;
      date="";
      fetchMessages();
    }
  }, (err) => {
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });

}

function chooseImage(){
  let chooseFile=document.createElement("input");
  chooseFile.type="file";
  chooseFile.click();
  chooseFile.onchange=(event)=>{
    let file=event.target.files[0];
    let reader=new FileReader();
    reader.addEventListener("load",()=>{
      url=reader.result;
      let preview=document.querySelector(".preview");
      preview.style.display="flex";
      document.body.style.overflow="hidden";
      preview.querySelector("img").src=url;
    })
    reader.readAsDataURL(file);
  }
}

function addImage(){
  let messageObj = { id: userId, message: `<img class="msg-img" src="${url}" alt="">`,type:"image", date: dateString(new Date()), time: timeString(new Date()) }
  conversation.messages.push(messageObj);
  fetchMessages();
  document.querySelector(".preview").style.display="none";
  document.body.style.overflow="auto";
  document.getElementById("msg").value = "";
  set(ref(db, "conversations/" + id + "/messages/" + conversation.messages.length), messageObj).then().catch(err => {
    showError("Something went wrong!!!");
    console.log(err);
  })
}