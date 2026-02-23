const $ = id => document.getElementById(id);

let customers = JSON.parse(localStorage.getItem("customers")) || [];

function save(){
  localStorage.setItem("customers", JSON.stringify(customers));
}

window.addCustomer = () =>{
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();

  if(!name) return alert("Enter name");

  customers.push({
    name,
    phone,
    balance:0,
    history:[]
  });

  $("name").value="";
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
