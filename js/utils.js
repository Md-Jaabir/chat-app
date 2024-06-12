function goTo(url){
  location.href=url;
}
function showError(msg){
  let closeButton=document.querySelector(".close");
  let errorBox=document.querySelector(".error");
  errorBox.querySelector(".msg").innerHTML=msg;
  errorBox.style.top=0;
  closeButton.addEventListener("click",closeError)
}

function closeError(){
  let errorBox=document.querySelector(".error");
  
  errorBox.style.top="-80px";
}

function loading(){
  const loadingScreen=document.querySelector(".loading");
  loadingScreen.style.display="flex";
}
function hideLoading(){
  const loadingScreen=document.querySelector(".loading");
  loadingScreen.style.display="none";
}

export default {goTo,showError,closeError,loading,hideLoading}