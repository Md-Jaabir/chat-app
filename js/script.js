import fireBaseSetup from './firebase-setup.js';
import fns from './utils.js';
let {db,get,set,ref,auth,child,signInWithEmailAndPassword,createUserWithEmailAndPassword}=fireBaseSetup;
let {goTo,showError,closeError,loading,hideLoading}=fns;
let url;
let signUpForm=document.querySelector("form.signup");
const nameInp=document.getElementById("name");
const emailInp=document.getElementById("email");
const passwordInp=document.getElementById("password");
const confirmPwdInput=document.getElementById("cpassword");
const profilePicInput=document.getElementById("profile-pic");
signUpForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  validate();
})

function validate(){
  let name=nameInp.value;
  let email=emailInp.value;
  let password=passwordInp.value;
  let cpassword=confirmPwdInput.value;
  let profilePic=profilePicInput.files[0];
  let emailRegex=/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  let passwordRegex=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  closeError();
  document.querySelectorAll(".signup input").forEach(inp=>{
    inp.classList.remove("err");
  });
  if(!name){
    showInputError("Name is required",nameInp);
  }else if(!email){
    showInputError("Email is required",emailInp);
  }else if(!password){
    showInputError("Password is required",passwordInp);
  }else if(!cpassword){
    showInputError("You must confirm your password",confirmPwdInput);
  }else if(!profilePic){
    showInputError("Profile picture is required",profilePicInput);
  }else if(name.length<3){
    showInputError("Name is too short",nameInp);
  }else if(password!==cpassword){
    showInputError("Password doesn't match",confirmPwdInput);
  }else if(profilePic.type!="image/png" && profilePic.type!="image/jpg" && profilePic.type!="image/jpeg"){
    showInputError("Please upload a valid image(png,jpg,jpeg)",profilePicInput);
  }else if(!email.match(emailRegex)){
    showInputError("Invalid email",emailInp);
  }else if(!password.match(passwordRegex)){
    showInputError("Password is too weak",passwordInp);
  }else{
    signup();
  }
  
}

function signup(){
  loading();
  createUserWithEmailAndPassword(auth,emailInp.value,passwordInp.value).then(cred=>{
    
    let userId=cred.user.uid;
    let userData={
      id:userId,
      name:nameInp.value,
      email:emailInp.value,
      profilePic:url,
    }
    localStorage.setItem("userId",userId);
    set(ref(db,"users/"+userId),userData).then(()=>{
      location.href="./index.html";
    }).catch((err)=>{
      showError(err);
      hideLoading();
    })
  }).catch(err=>{
    showError(err);
    hideLoading();
  })
}

function dataUrl(file){
  let reader=new FileReader();
  reader.addEventListener("load",()=>{
    url=reader.result;
  })
  reader.readAsDataURL(file);
}


profilePicInput.onchange=()=>{dataUrl(profilePicInput.files[0])};

function showInputError(msg,input){
  showError(msg);
  input.classList.add("err");
}

