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
