import fns from './utils.js';
import fireBaseSetup from './firebase-setup.js';
let {db,get,set,ref,auth,child}=fireBaseSetup;
let {goTo,showError,closeError,loading,hideLoading}=fns;
let logoutButton=document.querySelector(".logout");
let conversationContainer=document.querySelector(".conversations");
let user;
let conversations;
let userId=localStorage.getItem("userId");
document.querySelector(".new-conv").onclick=()=>{goTo('./new-conv.html')}
logoutButton.addEventListener("click",signout)
checkUser();
function checkUser(){
  loading();
  
  if(!userId){
    goTo("../signin.html")
  }
  user=JSON.parse(localStorage.getItem("user"));
  if(user){
    hideLoading();
    getConversations();
    return;
  }
  
  get(child(ref(db),`users/${userId}`)).then(snapshot=>{
    if(snapshot.exists()){
      user=snapshot.val();
      console.log(user);
      localStorage.setItem("user",JSON.stringify(user));
      hideLoading();
      getConversations();
    }else{
      alert("else")
      goTo("./signin.html");
    }
  }).catch(err=>{
    alert(err);
    goTo("./signin.html");
  })
}

function signout(){
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  goTo("./signin.html")
}

function getConversations(){
  console.log("users/"+userId.toString()+"/conversations");
  get(child(ref(db),"users/"+userId.toString()+"/conversations")).then(snapshot=>{
    if(snapshot.exists()){
      conversations=snapshot.val();
      if(!conversations){
        document.querySelector(".conversations .loading-text").innerHTML="No conversation yet"
        return;
      }
      fetchConversations();
      console.log(conversations);
    }else{
      document.querySelector(".conversations .loading-text").innerHTML="No conversation yet"
        return;
      console.log(err);
      showError("Something went wrong!!!!")
      hideLoading();
    }
  }).catch(err=>{
    console.log(err);
    showError("Something went wrong!!!!")
    hideLoading();
  })
}

function fetchConversations(){
  let conversationArr=Object.values(conversations);
  conversationArr=conversationArr.reverse();
  conversationContainer.innerHTML=conversationArr.map(conversation=>{
  let users=Object.values(conversation.users);
  let otherUser=users[0].id==userId?users[1]:users[0];
    return `<div id=${conversation.id} class="conversation">
      <div class="profile-image">
        <img src="${otherUser.profilePic}">
      </div>
      <div class="detail">
        <h3 class="name">${otherUser.name}</h3>
        <p>🔴 Active now</p>
      </div>
    </div>`;
  }).join("");
}