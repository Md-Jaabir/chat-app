import fns from './utils.js';
import fireBaseSetup from './firebase-setup.js';
let {db,get,set,ref,auth,child,push,update,onValue}=fireBaseSetup;
let {goTo,showError,closeError,loading,hideLoading,dateString,timeString}=fns;
let usersCont=document.querySelector(".users");
let searchForm=document.querySelector("form.search");
let user=JSON.parse(localStorage.getItem("user"));
let userId=localStorage.getItem("userId");
let conversations=JSON.parse(sessionStorage.getItem("conversations"));
let users;
let notificationSound2=new Audio('../assets/messagenote.mp3');
let calls=0;
checkUser();
checkForUpdates();
document.querySelector(".back").addEventListener("click",()=>{goTo("./index.html")});
searchForm.addEventListener("submit",filterUsers);
function checkUser(){
  loading();
  if(!userId || !user){
    goTo("./index.html")
  }else{
    hideLoading();
    getUsers();
  }
}
function getUsers(){
  get(child(ref(db),"users/")).then(snapshot=>{
    if(snapshot.exists()){
      users=snapshot.val();
      fetchUsers(users);
    }else{
      hideLoading();
      showError("Something went wrong!!!");
    }
  }).catch(err=>{
    hideLoading();
    
    showError("Something went wrong!!!");
  });
}

function fetchUsers(users){
  let sortedUsers=Object.values(users).sort(function (a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
});
  usersCont.innerHTML=sortedUsers.map((user)=>{
    if(userId==user.id) return;
    return `<div class="user">
      <div class="profile-image">
        <img load="lazy" src="${user.profilePic}">
      </div>
      <h3 class="name">${user.name}</h3>
      <button class="start" id='${JSON.stringify(user)}'>Start conversation</button>
    </div>`;
  }).join("");
  document.querySelectorAll("button.start").forEach(button=>{
    button.addEventListener("click",createConversation);
  });
}

function createConversation(event){
  loading();
  console.log("creating...")
  let profile;
  let profile2=JSON.parse(event.target.id);
  let alreadyHas=false;
  
  profile2.conversations && Object.values(profile2.conversations).forEach(con=>{
    console.log(con)
    if(con.users){
      let ids=Object.keys(con.users);
      console.log(ids);
      if(ids[0]==userId || ids[1]==userId){
        alreadyHas=true;
      }
    }
  });
  
  if(alreadyHas==true){
    showError("You already have a conversation with "+profile2.name);
    hideLoading();
    return;
  }
  
  get(child(ref(db),`users/${userId}`)).then(snapshot=>{
    
    if(snapshot.exists()){
      profile=snapshot.val();
      let id=push(child(ref(db), 'posts')).key;
      let conversation={
        id,
        users:{
          [profile.id]:{id:profile.id,name:profile.name,profilePic:profile.profilePic},
          [profile2.id]:{id:profile2.id,name:profile2.name,profilePic:profile2.profilePic},
        },
        messages:[{id:profile.id,message:"Hi",type:"text",date:dateString(new Date()),time:timeString(new Date())}]
      }
      set(ref(db,"conversations/"+id),conversation).then(()=>{
        
        let updates={};
        let updates2={};
        updates["users/"+profile.id+"/conversations/"+id]=conversation;
        updates2["users/"+profile2.id+"/conversations/"+id]=conversation;
        update(ref(db), updates).then(()=>{
          update(ref(db), updates2).then(()=>{
              goTo("./conversation.html?id="+id);
            }).catch((err)=>{
              console.log(err);
              showError("Something went wrong!!!");
            hideLoading();
            })
        }).catch((err)=>{
          console.log(err);
          showError("Something went wrong!!!");
        hideLoading();
        })
      }).catch((err)=>{
        console.log(err);
        showError("Something went wrong!!!");
        hideLoading();
      })
    }else{
      hideLoading();
      showError("Something went wrong!!!");
    }
  }).catch(err=>{
    console.log(err)
    hideLoading();
    showError("Something went wrong!!!");
  })
}

function minifyConversations(conversations){
  let minifiedConversations={};
  if(!conversations) return;
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
    if(calls<0){
      notificationSound2.play();
    }
    calls++;
    console.log("changed...");
    conversations=updatedConv;
    let minifiedConversations=minifyConversations(conversations);
      sessionStorage.setItem("conversations",JSON.stringify(minifiedConversations));
  },(err)=>{
    hideLoading();
    showError("Something went wrong!!!");
    console.log(err);
  });
}

function filterUsers(event){
  event.preventDefault();
  let query=document.querySelector("form.search input").value;
  if(!users){
    showError("Let the users load!!!");
    return;
  }
  let filteredArr=Object.values(users).filter(user=>{
    return user.name.toLowerCase().includes(query.toLowerCase());
  });
  fetchUsers(filteredArr)
}