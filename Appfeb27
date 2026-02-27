const $ = id => document.getElementById(id);

let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentIndex = null;

/* SAVE */
function save(){
  localStorage.setItem("customers", JSON.stringify(customers));
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

$("historyList").innerHTML = c.history.map(h=>`
  <div class="card">
    <b>${
      h.type==="udhar" ? "Udhaar" :
      h.type==="jama" ? "Jama" :
      "Item: "+h.item
    }</b> ₹ ${h.amount}
    ${h.note ? `<br><small>${h.note}</small>` : ""}
    <br><small>${h.date}</small>
  </div>
`).join("");
}

function renderPhotos(){
  if(currentIndex===null) return;

  const c = customers[currentIndex];
  const box = $("photoPreview");

  if(!c.photos) return box.innerHTML="";

  box.innerHTML = c.photos.map((p,i)=>`
    <div class="photoBox">
      <img src="${p.img}" onclick="zoomPhoto('${p.img}')">
      <button class="delPhoto" onclick="deletePhoto(${i})">×</button>
    </div>
  `).join("");
}

function renderGallery(){
  if(currentIndex===null) return;

  const c = customers[currentIndex];
  const box = $("galleryBox");

  if(!c.photos) return box.innerHTML="No photos";

  box.innerHTML = c.photos.map((p,i)=>`
    <div class="gItem">
      <img src="${p.img}" onclick="zoomPhoto('${p.img}')">
      <button class="delPhoto" onclick="deletePhoto(${i})">×</button>
      <div class="gCap">${p.caption || ""}</div>
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


/* ============= Smart Ai Logic ========== */ 
window.scanBillPro = async ()=>{
  if(currentIndex===null) return alert("Customer open karo");

  const file = $("billInput").files[0];
  if(!file) return alert("Bill photo select karo");

  $("scanBox").innerHTML="🤖 AI scanning...";

  const reader = new FileReader();

  reader.onload = async e=>{
    const result = await Tesseract.recognize(
      e.target.result,
      'eng',
      { logger: m => console.log(m) }
    );

    const text = result.data.text.toLowerCase();
    const lines = text.split("\n");

    let total=null, gst=null;
    let items=[];

    lines.forEach(l=>{
      const line=l.trim();

      // 🔥 TOTAL detect
      if(/total|grand/.test(line)){
        const m=line.match(/(\d+[\.,]?\d{0,2})/);
        if(m) total=parseFloat(m[1]);
      }

      // 🔥 GST detect
      if(/gst/.test(line)){
        const m=line.match(/(\d+[\.,]?\d{0,2})/);
        if(m) gst=parseFloat(m[1]);
      }

      // 🔥 Item detect (name + price)
      const itemMatch=line.match(/([a-z ]+)\s(\d+[\.,]?\d{0,2})$/);
      if(itemMatch){
        items.push({
          name:itemMatch[1],
          price:parseFloat(itemMatch[2])
        });
      }
    });

    // fallback → largest number = total
    if(!total){
      const nums=text.match(/\d+[\.,]?\d{0,2}/g);
      if(nums){
        const arr=nums.map(n=>parseFloat(n));
        total=Math.max(...arr);
      }
    }

    // UI Preview
    $("scanBox").innerHTML=`
      <b>Detected Total:</b> ₹ ${total || "Not found"}<br>
      <b>GST:</b> ₹ ${gst || "N/A"}<br>
      <b>Items:</b> ${items.length}
      <br><button onclick="applyBill(${total})">✅ Add to Khata</button>
    `;

    // Save items temp
    window.billItemsTemp=items;
  }

  reader.readAsDataURL(file);
}

/* ============= APPLY BILL =========== */ 
window.applyBill = (amt)=>{
  if(!amt) return alert("Amount missing");

  const c = customers[currentIndex];

  // Add total as udhar
  c.balance += amt;

  c.history.push({
    type:"udhar",
    amount:amt,
    note:"AI Bill Scan",
    date:new Date().toLocaleString()
  });

  // Add items history
  if(window.billItemsTemp){
    window.billItemsTemp.forEach(it=>{
      c.history.push({
        type:"item",
        item:it.name,
        amount:it.price,
        date:new Date().toLocaleString()
      });
    });
  }

  save();
  renderCustomer();
  render();
  closeSheet();

  alert("Bill added successfully ✅");
}
/* ======== Scan Bill ========== */ 
window.scanBill = async ()=>{
  if(currentIndex===null) return alert("Customer open karo");

  const file = $("billInput").files[0];
  if(!file) return alert("Bill photo select karo");

  $("scanResult").innerHTML="Scanning... ⏳";

  const reader = new FileReader();

  reader.onload = async e=>{
    const { data:{ text } } = await Tesseract.recognize(
      e.target.result,
      'eng'
    );

    // 🔥 Amount detect logic
    const amountMatch = text.match(/(\d+[\.,]?\d{0,2})/g);

    if(!amountMatch){
      $("scanResult").innerHTML="Amount detect nahi hua ❌";
      return;
    }

    // Largest number ko amount maanenge
    const numbers = amountMatch.map(n=>parseFloat(n.replace(",","")));
    const detectedAmount = Math.max(...numbers);

    $("scanResult").innerHTML=
      "Detected Amount: ₹ "+detectedAmount;

    // Auto fill manual tab
    $("custAmount").value = detectedAmount;
    $("entryType").value="udhar";
    openTab("manual");
  }

  reader.readAsDataURL(file);
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
