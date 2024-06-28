import fireBaseSetup from './firebase-setup.js';
import fns from './utils.js';
import { nanoid } from 'https://cdnjs.cloudflare.com/ajax/libs/nanoid/5.0.7/index.browser.js';
let { db, get, set, ref, auth, child, update, onValue, remove, setActiveTime } = fireBaseSetup;
let { goTo, showError, closeError, loading, hideLoading, dateString, timeString, convertLinks } = fns;
let id = location.search.split("=")[1];
let messageContainer = document.querySelector(".messages");
let userId = localStorage.getItem("userId");
let activeCont = document.querySelector(".top-bar .conversation .detail p")
let conversation;
let otherUser;
let date = "00/00/00";
let msgForm = document.querySelector("form.input");
let url;
let notificationSound = new Audio("../assets/notification.mp3");
setActiveTime(userId)
msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addMessage();
});
let notificationSound2 = new Audio('../assets/messagenote.mp3');
let calls2 = 0;
let calls = 0;
let lastActive;

document.querySelector(".back").addEventListener("click", () => { goTo("./index.html") });
document.querySelector("#image-selection").addEventListener("click", chooseImage);
document.querySelector(".preview button").addEventListener("click", addImage);
getConversation();
checkForUpdates();
checkActive();
checkUser();
console.log(convertLinks("Hello from "));

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

        onValue(ref(db, `users/${otherUser.id}/lastActive`), (snapshot) => {
          if (snapshot.val()) {
            lastActive = snapshot.val().split("/")[1]
          }
        })
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
        <p class="active-status">loading...</p>
      </div>`;
}
function fetchMessages() {
  let loaded = false;
  let msgs = Object.values(conversation.messages);
  msgs.sort((a, b) => {
    return a.date - b.date;
  })
  console.log(msgs);
  messageContainer.innerHTML = msgs.map(message => {
    let putDate = true;
    if (message.date) {
      if (dateString(date) == dateString(message.date)) {
        putDate = false;
      }
    }

    if (message.id !== userId && !message.isSeen) {
      console.log(message.id, userId)
      let updates = {};
      updates[`conversations/${conversation.id}/messages/${message._id}/isSeen`] = true;
      update(ref(db), updates).then(() => {
        console.log("success")
        if (document.querySelector(`.message.msg-${message._id} .bottom-section  .status`)) {
          document.querySelector(`.message.msg-${message._id} .bottom-section  .status`).innerHTML = "Seen"
        }

      });
    }
    onValue(ref(db, "conversations/" + conversation.id + "/messages/" + message._id + "/isSeen"), (snapshot) => {
      if (snapshot.val()) {
        let status = snapshot.val();
        if (document.querySelector(`.message.msg-${message._id} .bottom-section  .status`)) {
          document.querySelector(`.message.msg-${message._id} .bottom-section  .status`).innerHTML = status ? "Seen" : "Sent"
        }
      }
    })

    date = message.date;
    return `${putDate ? "<div class='date'>" + dateString(message.date) + "</div>" : ""} 
        <div class="message msg-${message._id} ${message.id == userId ? "me" : ""}">
       <div class="row">
         <div class="profile-image">
          <img load="lazy" src="${conversation.users[message.id].profilePic}">
        </div>
         <div class="box ${message.type}">${message.message}
          <button class="delete" id="delete-${message._id}">
            <i class="fa-solid fa-trash"></i>
           </button>
         </div>
         
       </div>
       
       <div class="bottom-section" >
       <div class="time">${message.date && timeString(message.date)}
       </div>
       <div class="status">${message.isSeen ? "Seen" : "Sent"}
       </div>
       </div>
    </div>`;
    if (!loaded) { loaded = true }
  }).join("");
  setTimeout(() => {
    window.scrollTo(0, parseFloat(getComputedStyle(messageContainer).getPropertyValue("height")));
  }, 500)
  document.querySelectorAll(".message .delete").forEach(btn => {
    btn.addEventListener("click", () => { deleteMessage(btn.id) })
  })

}
function addMessage() {
  let msgId = nanoid();
  let msg = document.getElementById("msg").value;
  if (msg == "") {
    showError("Please type something to send");
    return;
  }
  let messageObj = { _id: msgId, id: userId, message: convertLinks(msg), type: "text", date: Date.now() }
  conversation.messages[msgId] = messageObj;
  fetchMessages();
  document.getElementById("msg").value = "";
  set(ref(db, "conversations/" + id + "/messages/" + msgId), messageObj).then().catch(err => {
    showError("Something went wrong!!!");
    console.log(err);
  })
}
function checkActive() {
  setInterval(() => {
    if (!lastActive) return;
    if (Date.now() - parseInt(lastActive) <= 20000) {
      console.log(lastActive);
      document.querySelector(".active-status").innerHTML = "Active 🔵"
    } else {
      console.log("na")
      document.querySelector(".active-status").innerHTML = `Last active at: ${dateString(parseInt(lastActive))} ${timeString(parseInt(lastActive))}`
    }
  }, 5000);
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
    if (calls2 != 0) {
      notificationSound2.play();
    }
    calls2++;
    let minifiedConversations = minifyConversations(updatedConv);
    sessionStorage.setItem("conversations", JSON.stringify(minifiedConversations));
  }, (err) => {
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });
}
function checkUser() {
  loading();

  if (!userId) {
    goTo("../signin.html")
  }

}
function onMessage() {
  let messageRef = ref(db, "conversations/" + id + "/messages/");
  onValue(messageRef, (snapshot) => {
    let messages = snapshot.val();
    let messagesArr = Object.values(messages);
    if (messagesArr[messagesArr.length - 1].id != userId && calls != 0) {
      notificationSound.play();
    }
    calls++;
    if (messagesArr.length == Object.values(conversation.messages).length) {
    } else {
      conversation.messages = messages;
      date = "00/00/00";
      fetchMessages();
    }
  }, (err) => {
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });

}

function chooseImage() {
  let chooseFile = document.createElement("input");
  chooseFile.type = "file";
  chooseFile.click();
  chooseFile.onchange = (event) => {
    let file = event.target.files[0];
    if (file.type != "image/png" && file.type != "image/jpg" && file.type != "image/jpeg") {
      showError("Please select a valid image!!!");
      return;
    }
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      url = reader.result;
      let preview = document.querySelector(".preview");
      preview.style.display = "flex";
      document.body.style.overflow = "hidden";
      preview.querySelector("img").src = url;
    })
    reader.readAsDataURL(file);
  }
}

function addImage() {
  let msgId = nanoid();
  let messageObj = { _id: msgId, id: userId, message: `<img class="msg-img" src="${url}" alt="">`, type: "image", date: Date.now() }
  conversation.messages[msgId] = messageObj;
  fetchMessages();
  document.querySelector(".preview").style.display = "none";
  document.body.style.overflow = "auto";
  document.getElementById("msg").value = "";
  set(ref(db, "conversations/" + id + "/messages/" + msgId), messageObj).then().catch(err => {
    showError("Something went wrong!!!");
    console.log(err);
  })
}

function deleteMessage(id) {
  let msgId = id.replace("delete-", "");
  let message = conversation.messages[msgId];
  if (message.id != userId) {
    showError("You can't delete other person's message...")
    return;
  }
  console.log(msgId);
  let confirmation = confirm("Are you sure to delete the message");
  if (confirmation) {
    loading();
    remove(ref(db, `conversations/${conversation.id}/messages/${msgId}`)).then(() => {
      console.log("success");
      hideLoading();
    }).catch(err => {
      console.log(err);
      hideLoading();
    })
  }
}