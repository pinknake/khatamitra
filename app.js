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
      <b>${h.type==="udhar"?"Udhaar":"Jama"}</b> ₹ ${h.amount}
      <br><small>${h.date}</small>
    </div>
  `).join("");
}

/* ===== BOTTOM SHEET ===== */
window.openSheet = ()=> $("bottomSheet").classList.add("active");
window.closeSheet = ()=> $("bottomSheet").classList.remove("active");

/* TAB SWITCH */
window.openTab = (tabId)=>{
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));

  $(tabId).classList.add("active");
}

/* ADD ENTRY (MANUAL TAB) */
window.addEntry = ()=>{
  if(currentIndex===null) return alert("Open customer first");

  const type = $("entryType").value;
  const amount = Number($("custAmount").value);
  const note = $("custNote").value;

  if(!amount) return alert("Enter amount");

  const c = customers[currentIndex];

  if(type==="udhar") c.balance += amount;
  else c.balance -= amount;

  c.history.push({
    type,
    amount,
    note,
    date:new Date().toLocaleString()
  });

  $("custAmount").value="";
  $("custNote").value="";

  if(c.autoReminder) sendReminder();

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
