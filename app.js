const $ = id => document.getElementById(id);

let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentIndex = null;

/* SAVE */
function save(){
  localStorage.setItem("customers", JSON.stringify(customers));
}

window.openMainTab = (id)=>{
  document.querySelectorAll(".mainTab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".navBtn").forEach(b=>b.classList.remove("active"));

  document.getElementById(id).classList.add("active");

  const btn = [...document.querySelectorAll(".navBtn")]
    .find(b=>b.getAttribute("onclick")?.includes(id));
  if(btn) btn.classList.add("active");
}

window.searchCustomer = ()=>{
  const q = $("searchBox").value.toLowerCase();

  $("customerList").innerHTML = customers
    .filter(c=>c.name.toLowerCase().includes(q))
    .map((c,i)=>`
      <div class="card" onclick="openCustomer(${i})">
        <h3>${c.name}</h3>
        <p>Balance ₹ ${c.balance}</p>
      </div>
    `).join("");
}

window.toggleDark = ()=>{
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("darkMode",
    document.documentElement.classList.contains("dark"));
}

if(localStorage.getItem("darkMode")==="true"){
  document.documentElement.classList.add("dark");
}

/* ADD CUSTOMER */
window.addCustomer = ()=>{
  const name = $("customerName").value.trim();
  const phone = $("phone").value.trim();

  if(!name) return alert("Enter name");

  customers.push({
    name,
    phone,
    autoReminder:false,
    balance:0,
    history:[]
  });

  $("customerName").value="";
  $("phone").value="";

  save();
  render();
}

/* RENDER LIST */
function render(){
  $("customerList").innerHTML = customers.map((c,i)=>`
    <div class="card" onclick="openCustomer(${i})">
      <h3>${c.name}</h3>
      <p>Balance ₹ ${c.balance}</p>
    </div>
  `).join("");
}

/* OPEN CUSTOMER */
window.openCustomer = (i)=>{
  currentIndex = i;
  $("customerList").style.display="none";
  $("customerDetail").style.display="block";
  renderCustomer();
  renderPhotos(); // ⭐ ye missing tha
renderGallery();
}

/* CLOSE CUSTOMER */
window.closeCustomer = ()=>{
  $("customerList").style.display="block";
  $("customerDetail").style.display="none";
}

/* RENDER CUSTOMER */
function renderCustomer(){
  const c = customers[currentIndex];

  $("cName").textContent = c.name;
  $("cBalance").textContent = c.balance;
  $("autoReminder").checked = c.autoReminder;

  $("autoReminder").onchange = e=>{
    c.autoReminder = e.target.checked;
    save();
  }

$("historyList").innerHTML = c.history.map((h,i)=>`
  <tr>
    <td>${
      h.type==="udhar" ? "Udhar" :
      h.type==="jama" ? "Jama" :
      "Item"
    }</td>

    <td style="color:${
      h.type==="jama" ? "green" : "red"
    }">
      ₹ ${h.amount}
    </td>

    <td>${h.note || "-"}</td>

    <td>${h.date}</td>

    <td>
      <button class="deleteBtn" onclick="deleteEntry(${i})">Delete</button>
    </td>
  </tr>
`).join("");
}


window.deleteEntry = (i)=>{
  if(!confirm("Delete entry?")) return;

  const c = customers[currentIndex];
  const entry = c.history[i];

  if(entry.type==="udhar") c.balance -= entry.amount;
  if(entry.type==="jama") c.balance += entry.amount;
  if(entry.type==="item") c.balance -= entry.amount;

  c.history.splice(i,1);

  save();
  renderCustomer();
  render();
  updateDashboard();
}

function renderPhotos(){
  if(currentIndex===null) return;

  const c = customers[currentIndex];
  const box = $("photoPreview");

  if(!c.photos || !c.photos.length){
    box.innerHTML="No photos";
    return;
  }

  box.innerHTML = c.photos.map((p,i)=>`
    <div class="photoBox">
      <img class="thumb" src="${p.img}" onclick="zoomPhoto('${p.img}')">
      <button class="delPhoto" onclick="deletePhoto(${i})">×</button>
    </div>
  `).join("");
}

function renderGallery(){
  if(currentIndex===null) return;

  const c = customers[currentIndex];
  const box = $("galleryBox");

  if(!c.photos || !c.photos.length){
    box.innerHTML="No photos";
    return;
  }

  box.innerHTML = c.photos.map((p,i)=>`
    <div class="gItem">
      <img class="thumb" src="${p.img}" onclick="zoomPhoto('${p.img}')">
      <button class="delPhoto" onclick="deletePhoto(${i})">×</button>
      <div class="gCap">${p.caption || "No caption"}</div>
    </div>
  `).join("");
}

/* ======= Save Photos ====== */ 
window.savePhoto = ()=>{
  if(currentIndex===null) return alert("Customer open karo");

  const file = $("photoInput").files[0];
  const caption = $("photoCaption").value;

  if(!file) return alert("Photo select karo");

  const reader = new FileReader();

  reader.onload = e=>{
    const c = customers[currentIndex];
    if(!c.photos) c.photos=[];

    c.photos.push({
      img:e.target.result,
      caption,
      date:new Date().toLocaleString()
    });

    $("photoInput").value="";
    $("photoCaption").value="";

    save();
    renderPhotos();
    renderGallery();
    closeSheet();
  }

  reader.readAsDataURL(file);
}

  window.deletePhoto = (i)=>{
  if(!confirm("Delete photo?")) return;

  customers[currentIndex].photos.splice(i,1);
  save();
  renderPhotos();
  renderGallery(); // ⭐ ye add kar
}

  window.zoomPhoto = (img)=>{
  $("zoomImg").src = img;
  $("zoomModal").style.display="flex";
}

setTimeout(()=>{
  if($("zoomModal")){
    $("zoomModal").onclick = ()=> $("zoomModal").style.display="none";
  }
},500);

function updateDashboard(){

  let totalUdhar = 0;
  let totalJama = 0;
  let totalItems = 0;

  customers.forEach(c=>{
    c.history.forEach(h=>{
      if(h.type==="udhar") totalUdhar += h.amount;
      if(h.type==="jama") totalJama += h.amount;
      if(h.type==="item") totalItems += h.amount;
    });
  });

  const net = totalUdhar + totalItems - totalJama;

  $("dCustomers").textContent = customers.length;
  $("dUdhar").textContent = "₹ " + totalUdhar;
  $("dJama").textContent = "₹ " + totalJama;
  $("dItems").textContent = "₹ " + totalItems;
  $("dBalance").textContent = "₹ " + net;
}


window.addItem = ()=>{
  if(currentIndex===null) return alert("Customer open karo");

  const name = $("itemName").value.trim();
  const price = Number($("itemPrice").value);

  if(!name || !price) return alert("Item aur price likho");

  const c = customers[currentIndex];

  c.balance += price;

  c.history.push({
    type:"item",
    item:name,
    amount:price,
    date:new Date().toLocaleString()
  });

  $("itemName").value="";
  $("itemPrice").value="";

  save();
  renderCustomer();
  render();
  updateDashboard();
  closeSheet();
}

/* ===== BOTTOM SHEET ===== */
window.openSheet = ()=> $("bottomSheet").classList.add("active");
window.closeSheet = ()=> $("bottomSheet").classList.remove("active");

/* TAB SWITCH */
window.openTab = (tabId)=>{
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));

  $(tabId).classList.add("active");

  const btn = [...document.querySelectorAll(".tabs button")]
    .find(b=>b.getAttribute("onclick").includes(tabId));
  if(btn) btn.classList.add("active");
}

/* ADD ENTRY (MANUAL TAB) */
window.addManualEntry = ()=>{
  if(currentIndex===null){
    alert("Customer open karo pehle");
    return;
  }

  const type = $("entryType").value;
  const amt = Number($("custAmount").value);
  const note = $("custNote").value;

  if(!amt) return alert("Amount likho");

  const c = customers[currentIndex];

  if(type==="udhar") c.balance += amt;
  else c.balance -= amt;

  c.history.push({
    type,
    amount:amt,
    note,
    date:new Date().toLocaleString()
  });

  $("custAmount").value="";
  $("custNote").value="";

  save();
  renderCustomer();
  render();
  updateDashboard();
  closeSheet();
}
/* WHATSAPP REMINDER */
window.sendReminder = ()=>{
  const c = customers[currentIndex];

  if(!c.phone) return alert("Phone missing");

  let msg = `🙏 Namaste ${c.name}\nBalance ₹${c.balance}\nKhata Mitra`;

  window.open(`https://wa.me/91${c.phone}?text=${encodeURIComponent(msg)}`);
}

/* PDF EXPORT */
window.exportPDF = ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const c = customers[currentIndex];

  let y=20;
  doc.text(`Customer: ${c.name}`,10,y);
  y+=10;

  c.history.forEach(h=>{
    doc.text(`${h.type} ₹${h.amount} ${h.date}`,10,y);
    y+=10;
  });

  doc.save(`${c.name}.pdf`);
}

/* INIT */
render();
updateDashboard();
