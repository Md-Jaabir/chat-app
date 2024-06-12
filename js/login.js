import fireBaseSetup from './firebase-setup.js';
import fns from './utils.js';
let {db,get,set,ref,auth,child,signInWithEmailAndPassword,createUserWithEmailAndPassword}=fireBaseSetup;
let {goTo,showError,closeError,loading,hideLoading}=fns;
let loginForm=document.querySelector("form.signin");
const emailInp=document.getElementById("email");
const passwordInp=document.getElementById("password");
loginForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  validate();
})

function validate(){
  let email=emailInp.value;
  let password=passwordInp.value;
  let emailRegex=/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  closeError();
  document.querySelectorAll(".signin input").forEach(inp=>{
    inp.classList.remove("err");
  });
  if(!email){
    showInputError("Email is required",emailInp);
  }else if(!password){
    showInputError("Password is required",passwordInp);
  }else if(!email.match(emailRegex)){
    showInputError("Invalid email",emailInp);
  }else{
    signin();
  }
  
}

function signin(){
  loading();
  signInWithEmailAndPassword(auth,emailInp.value,passwordInp.value).then(cred=>{
    let userId=cred.user.uid;
    localStorage.setItem("userId",userId);
    location.href="./index.html";
  }).catch(err=>{
    let msg=err.code.split("/")[1].replaceAll("-"," ");
    showError(msg);
    console.log(err);
    hideLoading();
  })
}

function showInputError(msg,input){
  showError(msg);
  input.classList.add("err");
}

