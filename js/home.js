import fns from './utils.js';
import fireBaseSetup from './firebase-setup.js';
let {db,get,set,ref,auth,child,onValue}=fireBaseSetup;
let {goTo,showError,closeError,loading,hideLoading}=fns;
let logoutButton=document.querySelector(".logout");
let conversationContainer=document.querySelector(".conversations");
let user;
let conversations=JSON.parse(sessionStorage.getItem("conversations"));
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
      localStorage.setItem("user",JSON.stringify({id:user.id,name:user.name}));
      hideLoading();
      getConversations();
    }else{
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
  sessionStorage.removeItem("conversations")
  goTo("./signin.html")
}

function getConversations(){
  if(conversations){
    checkForUpdates();
    fetchConversations();
    return;
  }
  get(child(ref(db),"users/"+userId.toString()+"/conversations")).then(snapshot=>{
    if(snapshot.exists()){
      
      conversations=snapshot.val();
      if(!conversations){
        document.querySelector(".conversations .loading-text").innerHTML="No conversation yet"
        return;
      }
      fetchConversations();
      checkForUpdates();
      let minifiedConversations=minifyConversations(conversations);
      sessionStorage.setItem("conversations",JSON.stringify(minifiedConversations));
    }else{
      document.querySelector(".conversations .loading-text").innerHTML="No conversation yet";
      hideLoading();
      return;
    }
  }).catch(err=>{
    console.log(err);
    showError("Something went wrong!!!!")
    hideLoading();
  })
}

function fetchConversations(){
  console.log("Updating conversations...");
  let conversationArr=Object.values(conversations);
  let otherUser;
  conversationArr=conversationArr.reverse();
  conversationContainer.innerHTML=conversationArr.map(conversation=>{
  let users=conversation.users?Object.values(conversation.users):undefined;
  if(users){
    otherUser=users[0].id==userId?users[1]:users[0];
  }else{
    otherUser=conversation.otherUser;
  }
    return `<div id=${conversation.id} class="conversation">
      <div class="profile-image">
        <img load="lazy" src="${otherUser.profilePic}">
      </div>
      <div class="detail">
        <h3 class="name">${otherUser.name}</h3>
        <p>Not active</p>
      </div>
    </div>`;
  }).join("");
  let conversationElements=Array.from(document.querySelectorAll(".conversation"));
  conversationElements.forEach((button,index)=>{
    button.addEventListener("click",(event)=>{
      console.log(conversationElements[index].id)
      goTo(`./conversation.html?id=${conversationElements[index].id}`);
    });
  });
}

function minifyConversations(conversations){
  let minifiedConversations={};
  Object.entries(conversations).forEach(([key,conversation],index)=>{
        
        let users=Object.values(conversation.users);
        let otherUser=users[0].id===userId?users[1]:users[0];
       minifiedConversations[key]={
          id:conversation.id,
          otherUser
        };
      });
      return minifiedConversations;
}

function checkForUpdates(){
  let conversationsRef=ref(db,`users/${userId}/conversations`);
  onValue(conversationsRef,(snapshot)=>{
    let updatedConv=snapshot.val();
    console.log("changed...");
    conversations=updatedConv;
    fetchConversations();
    let minifiedConversations=minifyConversations(conversations);
      sessionStorage.setItem("conversations",JSON.stringify(minifiedConversations));
  },(err)=>{
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });
}