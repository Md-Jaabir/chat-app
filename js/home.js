import fns from './utils.js';
import fireBaseSetup from './firebase-setup.js';
let { db, get, set, ref, update, auth, child, onValue, setActiveTime } = fireBaseSetup;
let { goTo, showError, closeError, loading, hideLoading } = fns;
let logoutButton = document.querySelector(".logout");
let conversationContainer = document.querySelector(".conversations");
let searchForm = document.querySelector("form.search");
let user;
let activeStatus = {};
let conversations = sessionStorage.getItem("conversations") == "undefined" ? {}: JSON.parse(sessionStorage.getItem("conversations"));
let userId = localStorage.getItem("userId");
document.querySelector(".new-conv").onclick = () => { goTo('./new-conv.html') }
logoutButton.addEventListener("click", signout);
let notificationSound = new Audio('../assets/notification.mp3');
let notificationSound2 = new Audio('../assets/messagenote.mp3');
let calls = 0;
searchForm.addEventListener("submit", filterConversations);

checkUser();
checkActive();
function checkActive() {
  setInterval(() => {
    Object.entries(activeStatus).forEach(([id, activeTime]) => {
      console.log(activeTime)
      if (Date.now() - parseInt(activeTime) <= 20000) {
        document.querySelector(`.active-indicator.user-${id}`).style.display = "inline";
      } else {
        document.querySelector(`.active-indicator.user-${id}`).style.display = "none";
      }
    })
  }, 5000)
}

function checkUser() {
  loading();

  if (!userId) {
    goTo("../signin.html")
  }
  setActiveTime(userId);
  user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    hideLoading();
    getConversations();
    return;
  }

  get(child(ref(db), `users/${userId}`)).then(snapshot => {
    if (snapshot.exists()) {
      user = snapshot.val();
      localStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name }));
      hideLoading();
      getConversations();
    } else {
      goTo("./signin.html");
    }
  }).catch(err => {
    alert(err);
    goTo("./signin.html");
  })
}

function signout() {
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  sessionStorage.removeItem("conversations")
  goTo("./signin.html")
}

function getConversations() {
  if (conversations && Object.values(conversations).length>0) {
    checkForUpdates();
    fetchConversations(conversations);

    return;
  }
  get(child(ref(db), "users/" + userId.toString() + "/conversations")).then(snapshot => {
    if (snapshot.exists()) {

      conversations = snapshot.val();
      if (!conversations || Object.values(conversations).length==0) {
        document.querySelector(".conversations .loading-text").innerHTML = "No conversation yet"
        return;
      }
      fetchConversations(conversations);
      checkForUpdates();
      let minifiedConversations = minifyConversations(conversations);
      sessionStorage.setItem("conversations", JSON.stringify(minifiedConversations));
    } else {
      document.querySelector(".conversations .loading-text").innerHTML = "No conversation yet";
      hideLoading();
      return;
    }
  }).catch(err => {
    console.log(err);
    showError("Something went wrong!!!!")
    hideLoading();
  })
}

function fetchConversations(conversations) {
  let conversationArr = Object.values(conversations);
  let otherUser;
  conversationArr = conversationArr.reverse();
  if(conversationArr.length==0){
    document.querySelector(".conversations .loading-text").innerHTML = "No conversation yet"
    return;
  }
  conversationContainer.innerHTML = conversationArr.map(conversation => {
    let users = conversation.users ? Object.values(conversation.users) : undefined;
    if (users) {
      otherUser = users[0].id == userId ? users[1] : users[0];
    } else {
      otherUser = conversation.otherUser;
    }
    get(child(ref(db), `conversations/${conversation.id}/messages`)).then((snapshot) => {
      if (snapshot.val()) {
        let messages = snapshot.val();
        let messageArr = Object.values(messages);
        messageArr.sort((a, b) => {
          return a.date - b.date;
        })
        let msg = messageArr[messageArr.length - 1];

        if (!msg.isSeen) {
          document.querySelector(`#${conversation.id} .last-msg`).classList.add("bold")
        }

        if (msg.type == 'image') {
          document.querySelector(`#${conversation.id} .last-msg`).innerHTML = (msg.id == userId ? "You" : "He") + " sent an image";
        } else {
          document.querySelector(`#${conversation.id} .last-msg`).innerHTML = (msg.id == userId ? "You:" : "He:") + " " + msg.message.substring(0, 30);
        }

      }
    }).catch((err) => {
      console.log(err)
      document.querySelector(`#${conversation.id} .last-msg`).innerHTML = "An error occured!!!";
    });
    onValue(ref(db, `conversations/${conversation.id}/messages`), (snapshot) => {
      if (snapshot.val()) {
        let messages = snapshot.val();
        let messageArr = Object.values(messages);
        messageArr.sort((a, b) => {
          return a.date - b.date;
        })
        let msg = messageArr[messageArr.length - 1];
        let previousVal = document.querySelector(`#${conversation.id} .last-msg`).innerHTML;
        if (!msg.isSeen) {
          document.querySelector(`#${conversation.id} .last-msg`).classList.add("bold")
        }
        if (msg.type == 'image') {
          document.querySelector(`#${conversation.id} .last-msg`).innerHTML = (msg.id == userId ? "You" : "He") + " sent an image";
        } else {
          document.querySelector(`#${conversation.id} .last-msg`).innerHTML = (msg.id == userId ? "You:" : "He:") + " " + msg.message.substring(0, 30);
        }

        let newVal = document.querySelector(`#${conversation.id} .last-msg`).innerHTML;
        if (previousVal != "Loading..." && previousVal != newVal) {
          notificationSound.play();
        }
      }
    }, (err) => {
      console.log(err)
      document.querySelector(`#${conversation.id} .last-msg`).innerHTML = "An error occured!!!";
    });

    onValue(ref(db, `users/${otherUser.id
      }/lastActive`), (snapshot) => {
        if (snapshot.val()) {
          console.log(snapshot.val())
          activeStatus[snapshot.val().split("/")[0]] = snapshot.val().split("/")[1];
          console.log(activeStatus)
        }
      })
    return `<div id=${conversation.id} class="conversation">
      <div class="profile-image">
        <img load="lazy" src="${otherUser.profilePic}">
      </div>
      <div class="detail">
        <h3 class="name">${otherUser.name}<span class="active-indicator user-${otherUser.id}">🔵</span></h3>
        <p class="last-msg">Loading...</p>
      </div>
    </div>`;
  }).join("");

  let conversationElements = Array.from(document.querySelectorAll(".conversation"));
  conversationElements.forEach((button, index) => {
    button.addEventListener("click", (event) => {
      goTo(`./conversation.html?id=${conversationElements[index].id}`);
    });
  });
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
    if (calls > 0) {
      notificationSound2.play();
    }
    calls++;
    conversations = updatedConv;
    fetchConversations(conversations);
    let minifiedConversations = minifyConversations(conversations);
    sessionStorage.setItem("conversations", JSON.stringify(minifiedConversations));
  }, (err) => {
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });
}

function filterConversations(event) {
  event.preventDefault();
  let query = document.querySelector("form.search input").value;
  if (!conversations) {
    showError("Let the conversations load!!!");
    return;
  }
  let filteredArr = Object.values(conversations).filter(conversation => {
    let users = Object.values(conversation.users);
    let otherUser = users[0].id == userId ? users[1] : users[0];
    return otherUser.name.toLowerCase().includes(query.toLowerCase());
  });
  fetchConversations(filteredArr)
}
