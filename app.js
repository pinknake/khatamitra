const $ = id => document.getElementById(id);

let customers = JSON.parse(localStorage.getItem("customers")) || [];

function save(){
  localStorage.setItem("customers", JSON.stringify(customers));
}

window.addCustomer = ()=>{
  const name = $("customerName").value;
  const phone = $("phone").value;

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

function render(){
  const list = $("customerList");

  list.innerHTML = customers.map((c,i)=>`
    <div class="card">
      <h3>${c.name}</h3>
      <p class="${c.balance>=0?'balance-red':'balance-green'}">
        Balance ₹ ${c.balance}
      </p>
      <button onclick="openCustomer(${i})">Open</button>
    </div>
  `).join("");
}

window.openCustomer = (i)=>{
  alert("Customer page next step me banega 😎");
}

render();


let currentIndex = null;

/* OPEN CUSTOMER */
window.openCustomer = (i)=>{
  currentIndex = i;

  $("customerList").style.display="none";
  $("customerDetail").style.display="block";

  renderCustomer();
}

/* CLOSE */
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

$("autoReminder").onchange = (e)=>{
  c.autoReminder = e.target.checked;
  save();
}
  $("historyList").innerHTML = c.history.map(h=>`
    <div class="card">
      <b>${h.type==="given"?"Udhaar":"Paid"}</b> ₹ ${h.amount}
      <br><small>${h.date}</small>
    </div>
  `).join("");
}

/* ADD ENTRY */
window.addEntry = (type)=>{
  const amt = Number($("amount").value);

  if(!amt) return alert("Enter amount");

  const c = customers[currentIndex];

  if(type==="given") c.balance += amt;
  else c.balance -= amt;

  c.history.push({
    type,
    amount:amt,
    date:new Date().toLocaleString()
  });

  $("amount").value="";
  
if(c.autoReminder){
  sendReminder();
}
  save();
  renderCustomer();
  render();
}

/* WHATSAPP REMINDER */
window.sendReminder = ()=>{

  const c = customers[currentIndex];

  if(!c.phone){
    alert("Customer phone number nahi hai!");
    return;
  }

  let msg = `🙏 Namaste ${c.name}\n\n`;
  msg += `Aapka Khata Mitra par balance ₹${c.balance} hai.\n\n`;

  if(c.balance>0){
    msg += "Kripya jaldi payment kare.\n";
  }else{
    msg += "Aapka khata clear hai 👍\n";
  }

  msg += "\nThanks 🙏\nKhata Mitra App";

  const url = `https://wa.me/91${c.phone}?text=${encodeURIComponent(msg)}`;

  window.open(url);
}

window.exportPDF = () => {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const c = customers[currentIndex];

  let y = 15;

  /* ===== HEADER ===== */
  doc.setFillColor(255,107,0);
  doc.rect(0,0,210,25,"F");

  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.text("Khata Mitra Ledger", 70,15);

  y = 35;

  /* ===== CUSTOMER BOX ===== */
  doc.setTextColor(0,0,0);
  doc.setDrawColor(200);
  doc.rect(10,y,190,25);

  doc.setFontSize(12);
  doc.text(`Customer: ${c.name}`, 15, y+8);
  doc.text(`Phone: ${c.phone || "-"}`, 15, y+15);

  doc.text(`Balance: ₹ ${c.balance}`, 120, y+12);

  y += 35;

  /* ===== TABLE HEADER ===== */
  doc.setFillColor(240,240,240);
  doc.rect(10,y,190,10,"F");

  doc.text("Type", 15, y+7);
  doc.text("Amount", 70, y+7);
  doc.text("Date", 120, y+7);

  y += 15;

  /* ===== HISTORY ===== */
  c.history.forEach(h => {

    if(y>270){
      doc.addPage();
      y=20;
    }

    doc.text(h.type==="given"?"Udhaar":"Paid", 15, y);
    doc.text(`₹ ${h.amount}`, 70, y);
    doc.text(h.date, 120, y);

    y += 10;
  });

  /* ===== FOOTER ===== */
  y += 10;
  doc.line(130,y,190,y);
  doc.text("Authorized Sign", 135, y+8);

  doc.save(`${c.name}_KhataMitra.pdf`);
};


function openSheet(){
  document.getElementById("bottomSheet").classList.add("active");
}

function closeSheet(){
  document.getElementById("bottomSheet").classList.remove("active");
}

function openTab(tabId){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}
