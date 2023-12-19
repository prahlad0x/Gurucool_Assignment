let urlInp = document.getElementById("urlInp");
const token = localStorage.getItem("token");
let dataDiv = document.getElementById("data");
const loader = document.querySelector(".loaderDiv")
const searchesDiv = document.querySelector(".searches")
let RecentData = []

if (!token) {
  swal("Login Required!", { icon: "warning" }).then((res) => {
    window.location.href = "./login/loginSignup.html";
  });
}
else{
    getRecents()
}

function showData(){

    RecentData.sort((a, b) => new Date(b.time) - new Date(a.time))
    
    let html = `${RecentData.map(el=>getCard(el)).join("")}`

    searchesDiv.innerHTML = html

    let copybtns = document.querySelectorAll('.copyBtn')

    for(let btn of copybtns){
        btn.addEventListener('click',(e)=>{
            const linkToCopy = e.target.dataset.id
            
            navigator.clipboard.writeText(linkToCopy)
            .then(res=>{
                btn.style.color = "#34d634"
                btn.innerText = "✓ Copied"
                setTimeout(() => {
                    btn.style.color = "black"
                    btn.innerText = "Copy"
                }, 800);
            }).catch(err=>{
                console.log(err)
                swal("Unable to Copy!", {icon:"info"})
            })
           

        })
    }
}

function getCard(data){

    return `
        <div class="items">
            <div class="originalLink">${data.originalUrl}</div>
            <div class="newLinkDiv">
                <div><a href="http://localhost:8088/${data.shortUrl}">localhost:8088/${data.shortUrl}</a></div>
                <div><p id="${data._id}" class="copyBtn" data-id="http://localhost:8088/${data.shortUrl}">Copy</p></div>
            </div>
    </div>
    `
}

function getRecents(){
    loader.style.display = "flex"

    fetch(`http://localhost:8088/api/url/recents`, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.isOk) {
        RecentData= [...RecentData, ...data.recent]
        showData()
      } else {
        swal(data.message, { icon: "info" });
      }
    loader.style.display = "none"
      
    }).catch(err=>{
        console.log(err)
        swal("someting went wrong!",{icon:"error"})
    });
}

function getUrl() {
    
  let url = urlInp.value;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  if (!url) {
    urlInp.focus();
    return;
  }

  const isValid = urlRegex.test(url);
  if (!isValid) {
    swal("Please Enter a valid url", { icon: "info" });
    return;
  }

  loader.style.display = "inline-block"
  document.querySelector(".loaderDiv p").style.display = "none"

  fetch(`http://localhost:8088/api/url/shorten`, {
    method: "POST",
    body: JSON.stringify({ originalUrl: url }),
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.isOk) {
        addNewData(data.newUrl)
        showData()
        urlInp.value = ""
      } else {
        swal(data.message, { icon: "info" });
      }
        loader.style.display = "none"
        document.querySelector(".loaderDiv p").style.display = "flex"
    })
    .catch(err=>{
        console.log(err)
        loader.style.display = "none"
        document.querySelector(".loaderDiv p").style.display = "flex"
        swal("someting went wrong!",{icon:"error"})
    })
}


function addNewData(data){
    RecentData = RecentData.filter(el=> el._id != data._id)
    RecentData = [data,...RecentData]
}

function logout(){
    localStorage.clear()
    window.location.href = "../index.html"
}


