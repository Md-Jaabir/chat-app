import fireBaseSetup from './firebase-setup.js';
import fns from './utils.js';
let {db,get,set,ref,auth,child,onValue}=fireBaseSetup;
let {goTo,showError,closeError,loading,hideLoading}=fns;
let id=location.search.split("=")[1];
let messageContainer=document.querySelector(".messages");
let userId=localStorage.getItem("userId");
let conversation;
let otherUser;
document.querySelector(".back").addEventListener("click",()=>{goTo("./index.html")});
getConversation();
checkForUpdates();

function getConversation(){
    loading();
    get(child(ref(db),"conversations/"+id))
    .then(snapshot=>{
        if(snapshot.val()){
            conversation=snapshot.val();
            console.log(conversation.users);
            otherUser=Object.values(conversation.users)[0].id==userId?Object.values(conversation.users)[1]:Object.values(conversation.users)[0];
            fetchMessages();
            hideLoading();
        }
    })
    .catch(err=>{
        console.log(err);
        hideLoading();
        showError("Something went wrong!!!");
    })
}



function fetchMessages(){
    messageContainer.innerHTML=conversation.messages.map(message=>{
        return `<div class="message ${message.id==userId?"me":""}">
       <div class="row">
         <div class="profile-image">
          <img load="lazy" src="${conversation.users[message.id].profilePic}">
        </div>
         <div class="box">${message.message}</div>
       </div>
       <div class="time">${message.time}</div>
    </div>`;
    }).join("");
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
      let minifiedConversations=minifyConversations(updatedConv);
        sessionStorage.setItem("conversations",JSON.stringify(minifiedConversations));
    },(err)=>{
      hideLoading();
      showError("Something went wrong!!!");
      console.log(err);
    });
  }