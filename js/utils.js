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
  document.body.style.overflow="hidden";
}
function hideLoading(){
  const loadingScreen=document.querySelector(".loading");
  loadingScreen.style.display="none";
  document.body.style.overflow="auto";
}



function dateString(date){
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
}

function timeString(date){
  return `${date.getHours()>12?date.getHours()-12:date.getHours()}:${date.getMinutes()} ${date.getHours()>12?"PM":"AM"}`;
}

export default {goTo,showError,closeError,loading,hideLoading,dateString,timeString}