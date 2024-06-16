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

function convertLinks(str){
  let links=[];
  let copyStr=str;
  loop(str);
  function loop(str){
    let linkRegEx=/(https)?:\/\/[^\s]+/
    let matches=str.match(linkRegEx);
    if(matches){
      links.push(matches[0]);
      str=str.replace(matches[0],"");
      loop(str);
    }else{
      return;
    }
  }
  links.forEach(link=>{
    copyStr=copyStr.replace(link,`<a href='${link}'>${link}</a>`)
  })
  return copyStr;
}

function dateString(date){
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
}

function timeString(date){
  return `${date.getHours()>12?date.getHours()-12:date.getHours()}:${date.getMinutes()} ${date.getHours()>12?"PM":"AM"}`;
}

export default {goTo,showError,closeError,loading,hideLoading,dateString,timeString,convertLinks}