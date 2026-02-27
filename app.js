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
  history.pushState({page:"customer"},"");
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

const sorted = [...c.history].sort((a,b)=> new Date(b.date)-new Date(a.date));

$("historyList").innerHTML = sorted.map((h,i)=>{

  let badge="";

  if(h.type==="udhar") badge='<span class="badge bUdhar">Udhar</span>';
  else if(h.type==="jama") badge='<span class="badge bJama">Jama</span>';
  else if(h.type==="item"){
    if(h.itemType==="purchase") badge='<span class="badge bPurchase">Purchase</span>';
    else badge='<span class="badge bSales">Sales</span>';
  }

  return `
    <tr>
      <td>${badge} ${h.item? h.item:""}</td>
      <td style="color:${h.type==="jama"?"green":"red"};font-weight:bold">
        ₹ ${h.amount}
      </td>
      <td>${h.note || "-"}</td>
      <td>${h.date}</td>
      <td><button onclick="deleteEntry(${i})">Delete</button></td>
    </tr>
  `;
}).join("");
  
}

window.onpopstate = ()=>{
  if($("customerDetail").style.display==="block"){
    closeCustomer();
  }
  else if($("bottomSheet").classList.contains("active")){
    closeSheet();
  }
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

/* ========= Add Items ========= */ 
window.addItem = ()=>{
  if(currentIndex===null) return alert("Customer open karo");

  const name = $("itemName").value.trim();
  const price = Number($("itemPrice").value);
  const type = $("itemType").value;
  const gst = Number($("itemGST").value) || 0;

  if(!name || !price) return alert("Item aur price likho");

  const gstAmt = Math.round(price * gst / 100);
  const finalAmt = price + gstAmt;

  const c = customers[currentIndex];

  if(type==="purchase") c.balance += finalAmt;
  else c.balance -= finalAmt;

  c.history.push({
    type:"item",
    item:name,
    itemType:type,
    amount:finalAmt,
    gst:gst,
    note:`${type} ${gst? "| GST "+gst+"%":""}`,
    date:new Date().toLocaleString()
  });

  $("itemName").value="";
  $("itemPrice").value="";
  $("itemGST").value="";

  save();
  renderCustomer();
  render();
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

  /* HEADER */
  doc.setFillColor(106,27,154);
  doc.rect(0,0,210,25,"F");

  doc.setFontSize(18);
  doc.setTextColor(255,255,255);
  doc.text("Khata Mitra Ledger",10,15);

  /* CUSTOMER INFO */
  doc.setTextColor(0,0,0);
  doc.setFontSize(12);

  let y = 35;
  doc.text(`Customer: ${c.name}`,10,y);
  y+=7;

  doc.text(`Phone: ${c.phone || "-"}`,10,y);
  y+=7;

  doc.setFontSize(14);
  doc.text(`Balance: ₹ ${c.balance}`,10,y);
  y+=10;

  /* TABLE HEADER */
  doc.setFillColor(230,230,230);
  doc.rect(10,y,190,8,"F");

  doc.setFontSize(11);
  doc.text("Type",12,y+5);
  doc.text("Amount",50,y+5);
  doc.text("Note",90,y+5);
  doc.text("Date",150,y+5);

  y+=12;

  /* TABLE BODY */
  c.history.forEach(h=>{
    if(y>270){
      doc.addPage();
      y=20;
    }

    let typeText="";
    if(h.type==="udhar") typeText="Udhar";
    else if(h.type==="jama") typeText="Jama";
    else if(h.type==="item") typeText=h.item;

    /* COLOR LOGIC */
    if(h.type==="jama") doc.setTextColor(46,125,50);
    else if(h.type==="item") doc.setTextColor(25,118,210);
    else doc.setTextColor(229,57,53);

    doc.text(typeText,12,y);

    doc.text(`₹ ${h.amount}`,50,y);

    doc.setTextColor(0,0,0);
    doc.text(h.note || "-",90,y,{maxWidth:50});

    doc.text(h.date,150,y);

    y+=8;
  });

  /* FOOTER */
  y+=5;
  doc.setDrawColor(200);
  doc.line(10,y,200,y);
  y+=8;

  doc.setFontSize(14);
  doc.setTextColor(106,27,154);
  doc.text(`Final Balance: ₹ ${c.balance}`,10,y);

  doc.save(`${c.name}_ledger.pdf`);
}
