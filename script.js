const STORAGE_KEY = "bccAppStateV1";

const adminAccounts = [
{
id:"ADM-PRINCIPAL",
role:"main_admin",
email:"admin@babycashcoin.com",
password:"Admin@2026",
name:"Admin Principal",
permissions:["all"]
},
{
id:"ADM-MISSIONS",
role:"admin_missions",
email:"admin.missions@babycashcoin.com",
password:"Missions@2026",
name:"Admin Missions",
permissions:["missions"]
},
{
id:"ADM-KYC",
role:"admin_kyc",
email:"admin.kyc@babycashcoin.com",
password:"Kyc@2026",
name:"Admin KYC",
permissions:["kyc"]
},
{
id:"ADM-REWARDS",
role:"admin_rewards",
email:"admin.rewards@babycashcoin.com",
password:"Rewards@2026",
name:"Admin Recompenses",
permissions:["rewards"]
},
{
id:"ADM-SUPPORT",
role:"admin_support",
email:"admin.support@babycashcoin.com",
password:"Support@2026",
name:"Admin Support",
permissions:["users"]
},
{
id:"ADM-FINANCE",
role:"admin_finance",
email:"admin.finance@babycashcoin.com",
password:"Finance@2026",
name:"Admin Finance",
permissions:["finance","transactions"]
}
];

const defaultMissions = [
{id:"MIS-CPALEAD",title:"CPALEAD Offerwall",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"},
{id:"MIS-OFFERTORO",title:"OFFERTORO Sondages",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"},
{id:"MIS-LOOTABLY",title:"LOOTABLY Videos",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"},
{id:"MIS-SOCIAL",title:"Reseaux sociaux",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"}
];

const supabaseReadySchema = {
users:"id,email,first_name,last_name,birth_date,role,pin_hash,created_at",
wallets:"user_id,main_balance,reward_balance,monthly_used,monthly_limit",
transactions:"id,user_id,type,amount,fees,status,created_at",
missions:"id,title,link,gain,duration,conditions,status",
mission_submissions:"id,user_id,mission_id,status,gain,created_at",
kyc:"id,user_id,status,files,created_at",
rewards:"id,user_id,gain,next_scratch_at",
admin_logs:"id,admin_id,action,target,created_at"
};

let state = loadState();
prepareState();
let session = JSON.parse(localStorage.getItem("bccSession") || "null");
let currentUser = null;
let visibleBalance = true;
let currentStream = null;
let pendingLocation = null;

const splashScreen = document.getElementById("splashScreen");
const authWall = document.getElementById("authWall");
const userDashboard = document.getElementById("userDashboard");
const adminDashboard = document.getElementById("adminDashboard");
const modal = document.getElementById("mainModal");
const modalContent = document.getElementById("modalContent");

function loadState(){
const saved = localStorage.getItem(STORAGE_KEY);
if(saved){
return JSON.parse(saved);
}

return {
users:[],
missions:defaultMissions,
transactions:[],
activities:[],
kycRequests:[],
missionProofs:[],
rewardSettings:{
gains:[10,25,50,100],
pool:5000,
dailyText:"Mission du jour bientot disponible",
dailyImage:""
},
settings:{
missionMaintenance:false,
feesBalance:0,
feeWithdrawals:[],
withdrawals:[],
schema:supabaseReadySchema
}
};
}

function createTestUser(){
return {
id:"BCCUSER-TEST-001",
role:"user",
firstName:"Test",
lastName:"User",
email:"user@testbcc.com",
password:"User@2026",
pin:"123456",
birthDate:"2000-01-01",
mobileMoney:"+000000000",
location:{lat:0,lng:0,accuracy:0},
acceptedRules:true,
banned:false,
kycStatus:"",
kycFiles:[],
kycImages:[],
mainBalance:1000,
rewardBalance:0,
monthlyUsed:0,
verified:false,
transactions:[],
missionStats:{validated:0,pending:0,rejected:0,earned:0},
missionSubmissions:[],
nextScratchAt:0,
createdAt:nowText()
};
}

function prepareState(){
let changed = false;

if(!Array.isArray(state.users)){
state.users = [];
changed = true;
}

if(!Array.isArray(state.missions)){
state.missions = defaultMissions;
changed = true;
}

if(!Array.isArray(state.transactions)){
state.transactions = [];
changed = true;
}

if(!Array.isArray(state.activities)){
state.activities = [];
changed = true;
}

if(!Array.isArray(state.kycRequests)){
state.kycRequests = [];
changed = true;
}

if(!Array.isArray(state.missionProofs)){
state.missionProofs = [];
changed = true;
}

if(!state.rewardSettings){
state.rewardSettings = {gains:[10,25,50,100],pool:5000,dailyText:"Mission du jour bientot disponible",dailyImage:""};
changed = true;
}

if(typeof state.rewardSettings.pool === "undefined"){
state.rewardSettings.pool = 5000;
changed = true;
}

if(!state.settings){
state.settings = {missionMaintenance:false,feesBalance:0,feeWithdrawals:[],withdrawals:[],schema:supabaseReadySchema};
changed = true;
}

if(typeof state.settings.feesBalance === "undefined"){ state.settings.feesBalance = 0; changed = true; }
if(!Array.isArray(state.settings.feeWithdrawals)){ state.settings.feeWithdrawals = []; changed = true; }
if(!Array.isArray(state.settings.withdrawals)){ state.settings.withdrawals = []; changed = true; }

state.users = state.users.map(user=>{
let nextUser = {...user};
if(!Array.isArray(nextUser.transactions)){ nextUser.transactions = []; changed = true; }
if(!Array.isArray(nextUser.missionSubmissions)){ nextUser.missionSubmissions = []; changed = true; }
if(!nextUser.missionStats){ nextUser.missionStats = {validated:0,pending:0,rejected:0,earned:0}; changed = true; }
if(typeof nextUser.mainBalance === "undefined"){ nextUser.mainBalance = 0; changed = true; }
if(typeof nextUser.rewardBalance === "undefined"){ nextUser.rewardBalance = 0; changed = true; }
if(typeof nextUser.monthlyUsed === "undefined"){ nextUser.monthlyUsed = 0; changed = true; }
if(typeof nextUser.nextScratchAt === "undefined"){ nextUser.nextScratchAt = 0; changed = true; }
if(typeof nextUser.kycStatus === "undefined"){ nextUser.kycStatus = ""; changed = true; }
if(!Array.isArray(nextUser.kycFiles)){ nextUser.kycFiles = []; changed = true; }
if(!Array.isArray(nextUser.kycImages)){ nextUser.kycImages = []; changed = true; }
if(typeof nextUser.mobileMoney === "undefined"){ nextUser.mobileMoney = ""; changed = true; }
if(typeof nextUser.banned === "undefined"){ nextUser.banned = false; changed = true; }
return nextUser;
});

state.missions = state.missions.map(mission=>{
let nextMission = {...mission};
if(typeof nextMission.link === "undefined"){
nextMission.link = "";
changed = true;
}
if(typeof nextMission.validation === "undefined"){ nextMission.validation = "manual"; changed = true; }
if(typeof nextMission.expiresAt === "undefined"){ nextMission.expiresAt = getMissionExpiry(nextMission.duration); changed = true; }
return nextMission;
});

if(!state.users.some(user=>user.email === "user@testbcc.com")){
state.users.push(createTestUser());
changed = true;
}

if(changed){
saveState();
}
}

function saveState(){
localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}

function setSession(value){
session = value;
localStorage.setItem("bccSession",JSON.stringify(value));
}

function uid(prefix){
return `${prefix}-${Date.now()}-${Math.floor(Math.random()*9999)}`;
}

function nowText(){
return new Date().toLocaleString("fr-FR");
}

function normalizePhone(value){
return value.replace(/\s+/g,"").replace(/[^\d+]/g,"");
}

function getMissionExpiry(duration){
const text = String(duration || "").toLowerCase();
const number = parseFloat(text.replace(",","."));
if(!number || number <= 0){
return 0;
}
let multiplier = 60000;
if(text.includes("h") || text.includes("heure")){
multiplier = 3600000;
}
if(text.includes("jour") || text.includes("j")){
multiplier = 86400000;
}
return Date.now() + number * multiplier;
}

function recycleExpiredMissions(){
const now = Date.now();
let changed = false;
state.missions.forEach(mission=>{
if(mission.status === "active" && mission.expiresAt && mission.expiresAt <= now){
mission.status = "expired";
changed = true;
}
});

const activeCount = state.missions.filter(mission=>mission.status === "active").length;
if(activeCount === 0){
const nextMission = state.missions.find(mission=>mission.status === "queue");
if(nextMission){
nextMission.status = "active";
nextMission.expiresAt = getMissionExpiry(nextMission.duration);
changed = true;
addActivity("mission_queue",`Mission file d'attente publiee : ${nextMission.title}`);
}
}

if(changed){
saveState();
}
}

function addActivity(type,message,userId){
state.activities.unshift({
id:uid("ACT"),
type,
message,
userId:userId || (currentUser ? currentUser.id : ""),
date:nowText()
});
state.activities = state.activities.slice(0,80);
saveState();
}
function findCurrentUser(){
if(!session){
return null;
}

if(session.type === "admin"){
return adminAccounts.find(admin=>admin.id === session.id) || null;
}

return state.users.find(user=>user.id === session.id) || null;
}

function hasPermission(permission){
if(!currentUser || session.type !== "admin"){
return false;
}

return currentUser.permissions.includes("all") || currentUser.permissions.includes(permission);
}

function openModal(content){
modal.style.display = "flex";
modalContent.innerHTML = content;
}

function closeModal(){
modal.style.display = "none";
stopCamera();
}

window.closeModal = closeModal;

window.addEventListener("click",(event)=>{
if(event.target === modal){
closeModal();
}
});

function showOnly(view){
splashScreen.classList.add("hidden");
authWall.classList.add("hidden");
userDashboard.classList.add("hidden");
adminDashboard.classList.add("hidden");
view.classList.remove("hidden");
}

setTimeout(()=>{
currentUser = findCurrentUser();

if(currentUser && session.type === "admin"){
showAdmin();
return;
}

if(currentUser && session.type === "user"){
showUser();
return;
}

showOnly(authWall);
},2000);

document.getElementById("showLoginBtn").addEventListener("click",()=>{
document.getElementById("showLoginBtn").classList.add("active");
document.getElementById("showRegisterBtn").classList.remove("active");
document.getElementById("loginForm").classList.remove("hidden");
document.getElementById("registerForm").classList.add("hidden");
});

document.getElementById("showRegisterBtn").addEventListener("click",()=>{
document.getElementById("showRegisterBtn").classList.add("active");
document.getElementById("showLoginBtn").classList.remove("active");
document.getElementById("registerForm").classList.remove("hidden");
document.getElementById("loginForm").classList.add("hidden");
});

document.getElementById("requestLocationBtn").addEventListener("click",()=>{
if(!navigator.geolocation){
alert("Geolocalisation non disponible");
return;
}

navigator.geolocation.getCurrentPosition(position=>{
pendingLocation = {
lat:position.coords.latitude,
lng:position.coords.longitude,
accuracy:position.coords.accuracy
};
document.getElementById("locationStatus").innerText = "Position validee.";
},()=>{
pendingLocation = null;
document.getElementById("locationStatus").innerText = "Position refusee. Inscription annulee.";
alert("La position est obligatoire pour creer un compte.");
});
});

document.getElementById("registerForm").addEventListener("submit",(event)=>{
event.preventDefault();

const firstName = document.getElementById("regFirstName").value.trim();
const lastName = document.getElementById("regLastName").value.trim();
const email = document.getElementById("regEmail").value.trim().toLowerCase();
const emailConfirm = document.getElementById("regEmailConfirm").value.trim().toLowerCase();
const password = document.getElementById("regPassword").value;
const passwordConfirm = document.getElementById("regPasswordConfirm").value;
const pin = document.getElementById("regPin").value.trim();
const mobileMoney = normalizePhone(document.getElementById("regMobileMoney").value.trim());
const birthDate = document.getElementById("regBirthDate").value;
const acceptRules = document.getElementById("acceptRules").checked;

if(email !== emailConfirm){
alert("Les emails ne correspondent pas.");
return;
}

if(password !== passwordConfirm){
alert("Les mots de passe ne correspondent pas.");
return;
}

if(password.length < 6){
alert("Mot de passe trop court.");
return;
}

if(!/^\d{6}$/.test(pin)){
alert("Le PIN doit contenir exactement 6 chiffres.");
return;
}

if(mobileMoney.length < 8){
alert("Numero Mobile Money invalide.");
return;
}

if(!pendingLocation){
alert("La localisation est obligatoire.");
return;
}

if(!acceptRules){
alert("Vous devez accepter les regles et la confidentialite.");
return;
}

if(state.users.some(user=>user.email === email) || adminAccounts.some(admin=>admin.email === email)){
alert("Cet email existe deja.");
return;
}

if(state.users.some(user=>normalizePhone(user.mobileMoney || "") === mobileMoney)){
alert("Ce numero Mobile Money existe deja. Un meme numero ne peut creer qu'un compte.");
return;
}

const user = {
id:uid("BCCUSER"),
role:"user",
firstName,
lastName,
email,
password,
pin,
birthDate,
mobileMoney,
location:pendingLocation,
acceptedRules:true,
banned:false,
kycStatus:"",
kycFiles:[],
kycImages:[],
mainBalance:0,
rewardBalance:0,
monthlyUsed:0,
verified:false,
transactions:[],
missionStats:{validated:0,pending:0,rejected:0,earned:0},
missionSubmissions:[],
nextScratchAt:0,
createdAt:nowText()
};

state.users.push(user);
saveState();
addActivity("register",`${firstName} ${lastName} a cree un compte`,user.id);
setSession({type:"user",id:user.id});
currentUser = user;
showUser();
});

document.getElementById("loginForm").addEventListener("submit",(event)=>{
event.preventDefault();

const email = document.getElementById("loginEmail").value.trim().toLowerCase();
const password = document.getElementById("loginPassword").value;
const admin = adminAccounts.find(item=>item.email === email && item.password === password);

if(admin){
setSession({type:"admin",id:admin.id});
currentUser = admin;
showAdmin();
return;
}

const user = state.users.find(item=>item.email === email && item.password === password);

if(user){
if(user.banned){
alert("Compte banni. Contactez le support.");
return;
}
setSession({type:"user",id:user.id});
currentUser = user;
showUser();
return;
}

alert("Identifiants incorrects.");
});

document.getElementById("forgotPasswordBtn").addEventListener("click",()=>{
openModal(`
<h2>Mot de passe oublie</h2>
<input id="forgotEmail" type="email" placeholder="Votre adresse email">
<input id="forgotMobile" type="tel" placeholder="Numero Mobile Money du compte">
<input id="forgotNewPassword" type="password" placeholder="Nouveau mot de passe">
<button class="main-btn" id="confirmForgotBtn" style="width:100%;margin-top:16px">Reinitialiser</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("confirmForgotBtn").addEventListener("click",()=>{
const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
const mobile = normalizePhone(document.getElementById("forgotMobile").value.trim());
const newPassword = document.getElementById("forgotNewPassword").value;
const user = state.users.find(item=>item.email === email && normalizePhone(item.mobileMoney || "") === mobile);
if(!user){
alert("Aucun compte ne correspond a cet email et ce numero.");
return;
}
if(newPassword.length < 6){
alert("Mot de passe trop court.");
return;
}
user.password = newPassword;
saveState();
addActivity("support",`${email} a reinitialise son mot de passe`,user.id);
alert("Mot de passe mis a jour.");
closeModal();
});
},100);
});

function showUser(){
showOnly(userDashboard);
renderUserDashboard();
}

function getUserRef(){
return state.users.find(user=>user.id === currentUser.id);
}

function syncCurrentUser(){
if(session && session.type === "user"){
currentUser = getUserRef();
}
}

function renderUserDashboard(){
syncCurrentUser();
document.getElementById("userWelcome").innerText = `Bonjour ${currentUser.firstName}`;
document.getElementById("userUniqueId").innerText = currentUser.id;
document.getElementById("settingsEmail").innerText = currentUser.email;
updateBalance();
renderTransactions();
renderMissionStats();
renderMissions();
renderKyc();
updateRewardCountdown();
}

document.querySelectorAll(".nav-item").forEach(btn=>{
btn.addEventListener("click",()=>{
document.querySelectorAll(".page").forEach(page=>page.classList.remove("active-page"));
document.querySelectorAll(".nav-item").forEach(nav=>nav.classList.remove("active-nav"));
document.getElementById(btn.dataset.page).classList.add("active-page");
btn.classList.add("active-nav");
renderUserDashboard();
});
});

function updateBalance(){
syncCurrentUser();
const balanceText = document.getElementById("balanceText");
const cfaText = document.getElementById("cfaText");

if(visibleBalance){
balanceText.innerText = currentUser.mainBalance;
cfaText.innerText = `≈ ${currentUser.mainBalance} FCFA`;
}else{
balanceText.innerText = "••••";
cfaText.innerText = "≈ ••••";
}

document.getElementById("rewardBalance").innerText = `${currentUser.rewardBalance} BCC`;
document.getElementById("settingsMainBalance").innerText = currentUser.mainBalance;
document.getElementById("settingsRewardBalance").innerText = currentUser.rewardBalance;
document.getElementById("settingsUsedBalance").innerText = currentUser.monthlyUsed;
}

document.getElementById("toggleBalance").addEventListener("click",()=>{
visibleBalance = !visibleBalance;
document.getElementById("toggleBalance").innerHTML = visibleBalance
? '<i class="fa-regular fa-eye"></i>'
: '<i class="fa-regular fa-eye-slash"></i>';
updateBalance();
});

document.getElementById("themeToggle").addEventListener("click",()=>{
document.body.classList.toggle("dark");
document.getElementById("themeToggle").innerHTML = document.body.classList.contains("dark")
? '<i class="fa-solid fa-sun"></i>'
: '<i class="fa-solid fa-moon"></i>';
});

function renderTransactions(){
syncCurrentUser();
const list = document.getElementById("transactionHistory");
const title = document.getElementById("historyTitle");
const emptyText = document.getElementById("historyEmptyText");

if(currentUser.transactions.length === 0){
title.innerText = "Aucune transaction";
emptyText.classList.remove("hidden");
list.innerHTML = "";
return;
}

title.innerText = "Historique des transactions";
emptyText.classList.add("hidden");
list.innerHTML = currentUser.transactions.map(item=>`
<div class="history-item">
<strong>${item.name}</strong>
<span class="${item.type === "mission_gain" ? "gain-green" : ""}">Montant : ${item.type === "mission_gain" ? "+" : ""}${item.amount} BCC</span>
<span>Frais : ${item.fees} BCC</span>
<span>Status : ${item.status || "valide"}</span>
<span>${item.date}</span>
</div>
`).join("");
}

function askPin(actionName,onSuccess){
openModal(`
<h2>Verification PIN</h2>
<p style="margin-top:12px">${actionName}</p>
<input id="pinCheckInput" type="password" maxlength="6" placeholder="Votre PIN 6 chiffres">
<button class="main-btn" id="confirmPinBtn" style="width:100%;margin-top:16px">Valider</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("confirmPinBtn").addEventListener("click",()=>{
const pin = document.getElementById("pinCheckInput").value.trim();
syncCurrentUser();
if(pin !== currentUser.pin){
alert("PIN incorrect.");
return;
}
closeModal();
onSuccess();
});
},100);
}
document.getElementById("sendBtn").addEventListener("click",()=>{
askPin("Action sensible : envoyer des BCC",openSendModal);
});

function openSendModal(){
openModal(`
<h2>Envoyer BCC</h2>
<input id="sendName" placeholder="Nom du destinataire">
<input id="sendId" placeholder="ID BCC destinataire">
<input id="sendAmount" type="number" placeholder="Montant BCC">
<p style="margin-top:15px">Frais : 1%</p>
<button class="main-btn" id="confirmSendBtn" style="width:100%;margin-top:20px">Confirmer</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("confirmSendBtn").addEventListener("click",()=>{
const amount = parseFloat(document.getElementById("sendAmount").value);
const recipientName = document.getElementById("sendName").value.trim() || "Destinataire";
const fees = amount * 0.01;

syncCurrentUser();
if(!amount || amount <= 0){
alert("Montant invalide");
return;
}

if(amount + fees > currentUser.mainBalance){
alert("Solde insuffisant");
return;
}

currentUser.mainBalance -= amount + fees;
currentUser.monthlyUsed += amount;
state.settings.feesBalance += fees;

const transaction = {
id:uid("TX"),
name:recipientName,
amount:amount.toFixed(2),
fees:fees.toFixed(2),
date:nowText(),
type:"send",
status:"valide"
};

currentUser.transactions.unshift(transaction);
state.transactions.unshift({...transaction,userId:currentUser.id});
saveState();
addActivity("transaction",`${currentUser.email} a envoye ${amount} BCC`,currentUser.id);
renderUserDashboard();

openModal(`
<h2>Transfert effectue</h2>
<p style="margin-top:15px">Montant envoye : ${amount} BCC</p>
<p style="margin-top:10px">Frais : ${fees.toFixed(2)} BCC</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});
},100);
}

document.getElementById("receiveBtn").addEventListener("click",()=>{
syncCurrentUser();
openModal(`
<h2>Recevoir</h2>
<div class="receive-id-box">${currentUser.id}</div>
<button class="main-btn" id="copyIdBtn" style="width:100%;margin-top:20px">Copier ID</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("copyIdBtn").addEventListener("click",()=>{
navigator.clipboard.writeText(currentUser.id);
alert("ID copie");
});
},100);
});

document.getElementById("convertBtn").addEventListener("click",()=>{
askPin("Action sensible : convertir des BCC",()=>{
openModal(`
<h2>Convertir</h2>
<select id="withdrawOperator">
<option>Wave</option>
<option>Orange Money</option>
<option>MTN Money</option>
<option>Moov Money</option>
</select>
<input id="withdrawNumber" placeholder="Numero mobile money">
<input id="withdrawAmount" type="number" placeholder="Montant minimum 5000 BCC">
<button class="main-btn" id="confirmWithdrawBtn" style="width:100%;margin-top:20px">Valider</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("confirmWithdrawBtn").addEventListener("click",()=>{
syncCurrentUser();
const operator = document.getElementById("withdrawOperator").value;
const number = normalizePhone(document.getElementById("withdrawNumber").value.trim());
const amount = Number(document.getElementById("withdrawAmount").value || "0");
if(number !== normalizePhone(currentUser.mobileMoney || "")){
alert("Retrait refuse : utilisez le numero Mobile Money inscrit sur votre compte.");
return;
}
if(amount < 5000){
alert("Le retrait minimum est 5000 BCC.");
return;
}
if(amount > currentUser.mainBalance){
alert("Solde insuffisant.");
return;
}
currentUser.mainBalance -= amount;
const withdrawal = {
id:uid("WDR"),
userId:currentUser.id,
email:currentUser.email,
operator,
number,
amount,
status:"pending",
date:nowText()
};
state.settings.withdrawals.unshift(withdrawal);
currentUser.transactions.unshift({
id:withdrawal.id,
name:"Retrait en attente",
amount:amount.toFixed(2),
fees:"0.00",
date:withdrawal.date,
type:"withdrawal",
status:"en attente"
});
state.transactions.unshift({...withdrawal,type:"withdrawal",name:"Retrait Mobile Money",fees:"0.00"});
saveState();
addActivity("withdrawal",`${currentUser.email} demande un retrait de ${amount} BCC`,currentUser.id);
renderUserDashboard();
openModal(`
<h2>Retrait envoye</h2>
<p style="margin-top:15px">Votre demande est en attente de validation admin.</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});
},100);
});
});

document.getElementById("scanBtn").addEventListener("click",async()=>{
try{
const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
currentStream = stream;
openModal(`
<h2>Scanner QR</h2>
<video id="scannerVideo" autoplay playsinline style="width:100%;height:260px;border-radius:20px;margin-top:20px;background:black;object-fit:cover;"></video>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
document.getElementById("scannerVideo").srcObject = stream;
}catch(error){
alert("Acces camera refuse");
}
});

function stopCamera(){
if(currentStream){
currentStream.getTracks().forEach(track=>track.stop());
currentStream = null;
}
}

document.querySelector(".notif-btn").addEventListener("click",()=>{
openModal(`
<h2>Notifications</h2>
<p style="margin-top:15px">Aucune notification admin</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});

document.getElementById("dailyMissionBtn").addEventListener("click",()=>{
const image = state.rewardSettings.dailyImage;
openModal(`
<h2>Mission du jour</h2>
${image ? `<img class="admin-content-image" src="${image}" alt="Contenu admin">` : ""}
<p style="margin-top:15px">${state.rewardSettings.dailyText}</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});

function renderMissions(){
recycleExpiredMissions();
const list = document.getElementById("missionList");
const badge = document.getElementById("missionMaintenanceBadge");
const message = document.getElementById("missionMaintenanceMessage");

if(state.settings.missionMaintenance){
badge.classList.remove("hidden");
message.classList.remove("hidden");
list.innerHTML = "";
return;
}

badge.classList.add("hidden");
message.classList.add("hidden");
list.innerHTML = state.missions.filter(mission=>mission.status === "active").map(mission=>`
<div class="mission-group">
<h3>${mission.title}</h3>
${mission.link ? `<p>Lien : <a href="${mission.link}" target="_blank" rel="noopener">Ouvrir la mission</a></p>` : ""}
<p>Gain : <span class="gain-green">+${mission.gain} BCC</span></p>
<p>Duree : ${mission.duration}</p>
<p>Conditions : ${mission.conditions}</p>
${mission.validation === "manual" ? `<input type="file" accept="image/*" class="mission-proof-input" data-proof-input="${mission.id}">` : ""}
<button class="mission-btn" data-mission-id="${mission.id}">COMMENCER</button>
</div>
`).join("");

document.querySelectorAll("[data-mission-id]").forEach(button=>{
button.addEventListener("click",()=>{
const mission = state.missions.find(item=>item.id === button.dataset.missionId);
askPin("Action sensible : faire une mission",()=>{
if(mission.link){
window.open(mission.link,"_blank");
}
syncCurrentUser();
if(mission.validation === "auto"){
currentUser.mainBalance += mission.gain;
currentUser.missionStats.validated += 1;
currentUser.missionStats.earned += mission.gain;
const transaction = {
id:uid("TX"),
name:`Gain mission : ${mission.title}`,
amount:Number(mission.gain).toFixed(2),
fees:"0.00",
date:nowText(),
type:"mission_gain",
status:"reussi"
};
currentUser.transactions.unshift(transaction);
state.transactions.unshift({...transaction,userId:currentUser.id});
saveState();
addActivity("mission",`${currentUser.email} a reussi automatiquement ${mission.title}`,currentUser.id);
renderUserDashboard();
openModal(`
<h2>Mission reussie</h2>
<p class="gain-green" style="margin-top:15px">+${mission.gain} BCC</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
return;
}

const proofInput = document.querySelector(`[data-proof-input="${mission.id}"]`);
const proofFile = proofInput && proofInput.files[0];
if(!proofFile){
alert("Ajoutez une capture preuve avant d'envoyer la mission.");
return;
}

fileToDataUrl(proofFile).then(proofImage=>{
currentUser.missionStats.pending += 1;
const submission = {
id:uid("SUB"),
missionId:mission.id,
title:mission.title,
gain:mission.gain,
status:"pending",
proofName:proofFile.name,
proofImage,
date:nowText()
};
currentUser.missionSubmissions.unshift(submission);
state.missionProofs.unshift({...submission,userId:currentUser.id,email:currentUser.email});
saveState();
addActivity("mission",`${currentUser.email} a envoye une mission en attente`,currentUser.id);
renderUserDashboard();
openModal(`
<h2>Mission envoyee</h2>
<p style="margin-top:15px">Votre mission est maintenant en attente de validation.</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});
});
});
});
}

function renderMissionStats(){
syncCurrentUser();
document.getElementById("missionValidated").innerText = currentUser.missionStats.validated;
document.getElementById("missionPending").innerText = currentUser.missionStats.pending;
document.getElementById("missionRejected").innerText = currentUser.missionStats.rejected;
document.getElementById("missionEarned").innerText = currentUser.missionStats.earned;
}

document.getElementById("startKycBtn").addEventListener("click",()=>{
document.getElementById("kycUpload").click();
});

document.getElementById("kycUpload").addEventListener("change",(event)=>{
syncCurrentUser();
if(event.target.files.length === 0){
return;
}

Promise.all(Array.from(event.target.files).map(async file=>({
name:file.name,
data:await fileToDataUrl(file)
}))).then(files=>{
currentUser.kycStatus = "pending";
currentUser.kycFiles = files.map(file=>file.name);
currentUser.kycImages = files;
state.kycRequests.unshift({
id:uid("KYC"),
userId:currentUser.id,
email:currentUser.email,
files:currentUser.kycFiles,
images:files,
status:"pending",
date:nowText()
});
saveState();
addActivity("kyc",`${currentUser.email} a envoye ses fichiers KYC`,currentUser.id);
renderKyc();
});
});

function renderKyc(){
syncCurrentUser();
const status = document.getElementById("kycStatus");

if(!currentUser.kycStatus){
status.classList.add("hidden");
status.innerText = "";
return;
}

status.classList.remove("hidden");
status.innerText = currentUser.kycStatus === "pending"
? "En attente"
: currentUser.kycStatus === "validated"
? "Identite validee"
: "Identite refusee";
}

function changeSensitive(type){
const titles = {
pin:"Modifier PIN",
email:"Modifier Email",
password:"Changer Mot de Passe"
};

const oldLabel = type === "email" ? "Ancien email" : type === "pin" ? "Ancien PIN" : "Ancien mot de passe";
const newLabel = type === "email" ? "Nouvel email" : type === "pin" ? "Nouveau PIN 6 chiffres" : "Nouveau mot de passe";

openModal(`
<h2>${titles[type]}</h2>
<input id="oldSensitiveValue" type="${type === "email" ? "email" : "password"}" placeholder="${oldLabel}">
<input id="newSensitiveValue" type="${type === "email" ? "email" : "password"}" placeholder="${newLabel}">
<button class="main-btn" id="saveSensitiveBtn" style="width:100%;margin-top:16px">Enregistrer</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("saveSensitiveBtn").addEventListener("click",()=>{
syncCurrentUser();
const oldValue = document.getElementById("oldSensitiveValue").value.trim();
const newValue = document.getElementById("newSensitiveValue").value.trim();

if(type === "pin" && oldValue !== currentUser.pin){
alert("Ancien PIN incorrect.");
return;
}

if(type === "email" && oldValue.toLowerCase() !== currentUser.email){
alert("Ancien email incorrect.");
return;
}

if(type === "password" && oldValue !== currentUser.password){
alert("Ancien mot de passe incorrect.");
return;
}

if(type === "pin" && !/^\d{6}$/.test(newValue)){
alert("Le nouveau PIN doit contenir 6 chiffres.");
return;
}

if(type === "email" && !newValue.includes("@")){
alert("Email invalide.");
return;
}

if(type === "password" && newValue.length < 6){
alert("Mot de passe trop court.");
return;
}

currentUser[type] = type === "email" ? newValue.toLowerCase() : newValue;
saveState();
addActivity("security",`${currentUser.email} a modifie ${type}`,currentUser.id);
renderUserDashboard();
alert("Modification effectuee.");
closeModal();
});
},100);
}

document.getElementById("changePinBtn").addEventListener("click",()=>changeSensitive("pin"));
document.getElementById("changeEmailBtn").addEventListener("click",()=>changeSensitive("email"));
document.getElementById("changePasswordBtn").addEventListener("click",()=>changeSensitive("password"));

function getTomorrowTimestamp(){
const tomorrow = new Date();
tomorrow.setHours(24,0,0,0);
return tomorrow.getTime();
}
function updateRewardCountdown(){
syncCurrentUser();
if(!currentUser || session.type !== "user"){
return;
}

const scratchCard = document.getElementById("scratchCard");
const remaining = currentUser.nextScratchAt - Date.now();

if(remaining <= 0){
document.getElementById("rewardCountdown").innerText = "";
scratchCard.classList.remove("scratched");
scratchCard.innerHTML = `
<div class="gift-card-face">
<span class="gift-label">BABY CASH COIN</span>
<strong>CARTE CADEAU PREMIUM</strong>
<small>Gratte pour gagner des BCC</small>
</div>
`;
return;
}

const hours = Math.floor(remaining / 3600000);
const minutes = Math.floor((remaining % 3600000) / 60000);
const seconds = Math.floor((remaining % 60000) / 1000);
document.getElementById("rewardCountdown").innerText = `Reviens demain - ${hours}h ${minutes}m ${seconds}s`;
scratchCard.classList.add("scratched");
scratchCard.innerHTML = `
<div class="gift-card-face">
<span class="gift-label">BABY CASH COIN</span>
<strong>Deja grattee</strong>
<small>Reviens demain</small>
</div>
`;
}

document.getElementById("scratchCard").addEventListener("click",()=>{
syncCurrentUser();
if(currentUser.nextScratchAt > Date.now()){
updateRewardCountdown();
return;
}

const gains = state.rewardSettings.gains.length ? state.rewardSettings.gains : [10,25,50,100];
let gain = gains[Math.floor(Math.random()*gains.length)];
if(state.rewardSettings.pool <= 0){
alert("La recompense globale est terminee.");
return;
}
gain = Math.min(gain,state.rewardSettings.pool);
state.rewardSettings.pool -= gain;
currentUser.rewardBalance += gain;
currentUser.nextScratchAt = getTomorrowTimestamp();
saveState();
addActivity("reward",`${currentUser.email} a gagne ${gain} BCC`,currentUser.id);
renderUserDashboard();

document.getElementById("scratchCard").innerHTML = `
<div class="gift-card-face win">
<span class="gift-label">BABY CASH COIN</span>
<strong>${gain} BCC GAGNES</strong>
<small>Reviens demain</small>
</div>
`;
});

document.getElementById("transferRewardBtn").addEventListener("click",()=>{
syncCurrentUser();
if(currentUser.rewardBalance <= 0){
alert("Aucune recompense");
return;
}

currentUser.mainBalance += currentUser.rewardBalance;
currentUser.rewardBalance = 0;
saveState();
addActivity("reward_transfer",`${currentUser.email} a transfere ses recompenses`,currentUser.id);
renderUserDashboard();
openModal(`
<h2>Recompenses transferees</h2>
<p style="margin-top:15px">Le solde principal a ete mis a jour.</p>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});

document.getElementById("logoutBtn").addEventListener("click",()=>{
confirmLogout();
});

function confirmLogout(){
openModal(`
<h2>Deconnecter</h2>
<p style="margin-top:15px">Voulez-vous vraiment vous deconnecter ?</p>
<div class="confirm-row">
<button class="main-btn" id="confirmLogoutBtn">Oui</button>
<button class="close-btn" onclick="closeModal()">Non</button>
</div>
`);

setTimeout(()=>{
document.getElementById("confirmLogoutBtn").addEventListener("click",()=>{
localStorage.removeItem("bccSession");
session = null;
currentUser = null;
closeModal();
showOnly(authWall);
});
},100);
}

document.getElementById("levelBadge").addEventListener("click",()=>{
openModal(`
<h2>Niveaux BCC</h2>
<div style="margin-top:20px;display:flex;flex-direction:column;gap:12px;">
<div class="badge">Niveau 1 a 15 : BRONZE</div>
<div class="badge">Niveau 16 a 30 : SILVER</div>
<div class="badge">Niveau 31 a 45 : GOLD</div>
<div class="badge">Niveau 46 a 50 : PREMIUM</div>
<div class="badge">Niveau 51 a 60 : PRO</div>
<div class="badge">Niveau 65+ : SUPER PRO</div>
</div>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);
});

function showAdmin(){
showOnly(adminDashboard);
document.getElementById("adminRoleText").innerText = currentUser.name;
applyAdminPermissions();
activateFirstAllowedAdminPage();
renderAdmin();
}

function applyAdminPermissions(){
document.querySelectorAll(".admin-nav").forEach(button=>{
const page = button.dataset.adminPage;
const permissionMap = {
adminOverview:"all",
adminMissions:"missions",
adminRewards:"rewards",
adminKyc:"kyc",
adminUsers:"users",
adminFinance:"finance",
adminSettings:"maintenance"
};
const permission = permissionMap[page];
button.classList.toggle("hidden",!hasPermission(permission) && !hasPermission("all"));
});
}

function activateFirstAllowedAdminPage(){
const visibleNavs = Array.from(document.querySelectorAll(".admin-nav")).filter(button=>!button.classList.contains("hidden"));

document.querySelectorAll(".admin-nav").forEach(nav=>nav.classList.remove("active"));
document.querySelectorAll(".admin-page").forEach(page=>page.classList.remove("active-admin-page"));

if(visibleNavs.length > 0){
visibleNavs[0].classList.add("active");
document.getElementById(visibleNavs[0].dataset.adminPage).classList.add("active-admin-page");
}
}

document.querySelectorAll(".admin-nav").forEach(button=>{
button.addEventListener("click",()=>{
document.querySelectorAll(".admin-nav").forEach(nav=>nav.classList.remove("active"));
document.querySelectorAll(".admin-page").forEach(page=>page.classList.remove("active-admin-page"));
button.classList.add("active");
document.getElementById(button.dataset.adminPage).classList.add("active-admin-page");
renderAdmin();
});
});

document.getElementById("adminLogoutBtn").addEventListener("click",confirmLogout);

["adminMissionSearch","adminKycSearch","adminUserSearch","adminFinanceSearch"].forEach(id=>{
const input = document.getElementById(id);
if(input){
input.addEventListener("input",renderAdmin);
}
});

document.getElementById("adminWithdrawFeesBtn").addEventListener("click",()=>{
if(currentUser.role !== "main_admin"){
alert("Reserve a l'admin principal.");
return;
}
const number = normalizePhone(document.getElementById("adminFeeWithdrawNumber").value.trim());
const amount = Number(document.getElementById("adminFeeWithdrawAmount").value || "0");
if(number.length < 8){
alert("Numero Mobile Money invalide.");
return;
}
if(amount <= 0 || amount > state.settings.feesBalance){
alert("Montant invalide.");
return;
}
state.settings.feesBalance -= amount;
state.settings.feeWithdrawals.unshift({
id:uid("FEE"),
number,
amount,
date:nowText(),
status:"retire"
});
saveState();
addActivity("fees",`Admin principal a retire ${amount} BCC de frais appli`);
document.getElementById("adminFeeWithdrawAmount").value = "";
renderAdmin();
});

function renderAdmin(){
document.getElementById("adminUserCount").innerText = state.users.length;
document.getElementById("adminTransactionCount").innerText = state.transactions.length;
document.getElementById("adminPendingMissionCount").innerText = countPendingMissions();
document.getElementById("adminPendingKycCount").innerText = state.kycRequests.filter(item=>item.status === "pending").length;
document.getElementById("adminFeesBalance").innerText = Number(state.settings.feesBalance || 0).toFixed(2);
document.getElementById("adminRewardPoolView").innerText = Number(state.rewardSettings.pool || 0).toFixed(2);
document.querySelectorAll(".main-admin-only").forEach(item=>{
item.classList.toggle("hidden",currentUser.role !== "main_admin");
});
renderAdminActivities();
renderAdminMissions();
renderRewardSettings();
renderAdminKyc();
renderAdminUsers();
renderAdminFinance();
renderSubAdmins();
document.getElementById("missionMaintenanceToggle").checked = state.settings.missionMaintenance;
}

function countPendingMissions(){
return state.users.reduce((total,user)=>total + user.missionSubmissions.filter(item=>item.status === "pending").length,0);
}

function renderAdminActivities(){
document.getElementById("adminActivityList").innerHTML = state.activities.length
? state.activities.map(item=>`
<div class="list-row">
<strong>${item.type}</strong>
<span>${item.message}</span>
<small>${item.date}</small>
</div>
`).join("")
: `<div class="list-row">Aucune activite</div>`;
}

function renderAdminMissions(){
const search = (document.getElementById("adminMissionSearch")?.value || "").toLowerCase();
const proofs = state.missionProofs.filter(proof=>`${proof.email} ${proof.title} ${proof.status}`.toLowerCase().includes(search));
const missions = state.missions.filter(mission=>`${mission.title} ${mission.link} ${mission.status} ${mission.conditions}`.toLowerCase().includes(search));

document.getElementById("adminMissionList").innerHTML = [
...missions.map(mission=>`
<div class="list-row">
<strong>${mission.title}</strong>
<span class="status-pill ${mission.status}">${mission.status}</span>
<span>Lien : ${mission.link || "Aucun lien"}</span>
<span>Gain : <span class="gain-green">+${mission.gain} BCC</span></span>
<span>Duree : ${mission.duration}</span>
<span>Validation : ${mission.validation === "auto" ? "directe" : "manuelle"}</span>
<span>Conditions : ${mission.conditions}</span>
<div class="row-actions">
<button class="small-btn danger-btn" data-delete-mission="${mission.id}">Supprimer</button>
</div>
</div>
`),
...proofs.map(proof=>`
<div class="list-row">
<strong>Preuve mission : ${proof.title}</strong>
<span>Email : ${proof.email}</span>
<span>Gain : <span class="gain-green">+${proof.gain} BCC</span></span>
<span class="status-pill ${proof.status}">${proof.status}</span>
<small>${proof.date}</small>
${proof.proofImage ? `<img class="proof-preview" src="${proof.proofImage}" alt="Preuve mission">` : ""}
<div class="row-actions">
<button class="small-btn" data-mission-valid="${proof.id}">Valider</button>
<button class="small-btn danger-btn" data-mission-reject="${proof.id}">Refuser</button>
</div>
</div>
`)
].join("") || `<div class="list-row">Aucune mission ou preuve</div>`;

document.querySelectorAll("[data-delete-mission]").forEach(button=>{
button.addEventListener("click",()=>{
state.missions = state.missions.filter(mission=>mission.id !== button.dataset.deleteMission);
saveState();
addActivity("admin",`${currentUser.email} a supprime une mission`);
renderAdmin();
});
});

document.querySelectorAll("[data-mission-valid]").forEach(button=>{
button.addEventListener("click",()=>updateMissionProof(button.dataset.missionValid,"validated"));
});

document.querySelectorAll("[data-mission-reject]").forEach(button=>{
button.addEventListener("click",()=>updateMissionProof(button.dataset.missionReject,"rejected"));
});
}

document.getElementById("saveMissionBtn").addEventListener("click",()=>{
if(!hasPermission("missions") && !hasPermission("all")){
alert("Permission refusee.");
return;
}

const title = document.getElementById("adminMissionTitle").value.trim();
const link = document.getElementById("adminMissionLink").value.trim();
const gain = Number(document.getElementById("adminMissionGain").value || "0");
const duration = document.getElementById("adminMissionDuration").value.trim();
const validation = document.getElementById("adminMissionValidation").value;
const queueTarget = document.getElementById("adminMissionQueueTarget").value;
const conditions = document.getElementById("adminMissionConditions").value.trim();

if(!title){
alert("Titre obligatoire.");
return;
}

state.missions.unshift({
id:uid("MIS"),
title,
link,
gain,
duration:duration || "0 min",
conditions:conditions || "Conditions admin",
validation,
expiresAt:queueTarget === "active" ? getMissionExpiry(duration || "0 min") : 0,
status:queueTarget
});
saveState();
addActivity("admin",`${currentUser.email} a ajoute la mission ${title}`);
document.getElementById("adminMissionTitle").value = "";
document.getElementById("adminMissionLink").value = "";
document.getElementById("adminMissionGain").value = "";
document.getElementById("adminMissionDuration").value = "";
document.getElementById("adminMissionConditions").value = "";
renderAdmin();
});

function updateMissionProof(id,status){
if(!hasPermission("missions") && !hasPermission("finance") && !hasPermission("all")){
alert("Permission refusee.");
return;
}

const proof = state.missionProofs.find(item=>item.id === id);
if(!proof || proof.status !== "pending"){
return;
}

const user = state.users.find(item=>item.id === proof.userId);
const userSubmission = user.missionSubmissions.find(item=>item.id === id);
proof.status = status;
if(userSubmission){
userSubmission.status = status;
}
user.missionStats.pending = Math.max(0,user.missionStats.pending - 1);

if(status === "validated"){
user.mainBalance += Number(proof.gain);
user.missionStats.validated += 1;
user.missionStats.earned += Number(proof.gain);
const transaction = {
id:uid("TX"),
name:`Gain mission : ${proof.title}`,
amount:Number(proof.gain).toFixed(2),
fees:"0.00",
date:nowText(),
type:"mission_gain",
status:"reussi"
};
user.transactions.unshift(transaction);
state.transactions.unshift({...transaction,userId:user.id});
}else{
user.missionStats.rejected += 1;
}

saveState();
addActivity("admin",`${currentUser.email} a ${status} la mission de ${user.email}`);
renderAdmin();
}

function renderRewardSettings(){
document.getElementById("adminRewardGains").value = state.rewardSettings.gains.join(",");
document.getElementById("adminRewardPool").value = state.rewardSettings.pool;
document.getElementById("adminDailyText").value = state.rewardSettings.dailyText;
document.getElementById("adminDailyImage").value = state.rewardSettings.dailyImage;
}

function fileToDataUrl(file){
return new Promise((resolve,reject)=>{
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsDataURL(file);
});
}

document.getElementById("saveRewardSettingsBtn").addEventListener("click",async()=>{
if(!hasPermission("rewards") && !hasPermission("all")){
alert("Permission refusee.");
return;
}

const imageFile = document.getElementById("adminDailyImageFile").files[0];

state.rewardSettings.gains = document.getElementById("adminRewardGains").value
.split(",")
.map(item=>Number(item.trim()))
.filter(item=>item > 0);
state.rewardSettings.pool = Number(document.getElementById("adminRewardPool").value || state.rewardSettings.pool || 0);
state.rewardSettings.dailyText = document.getElementById("adminDailyText").value.trim() || "Mission du jour bientot disponible";
state.rewardSettings.dailyImage = imageFile
? await fileToDataUrl(imageFile)
: document.getElementById("adminDailyImage").value.trim();
saveState();
addActivity("admin",`${currentUser.email} a modifie la carte cadeau`);
alert("Carte cadeau mise a jour.");
});

function renderAdminKyc(){
const list = document.getElementById("adminKycList");
const search = (document.getElementById("adminKycSearch")?.value || "").toLowerCase();
const requests = state.kycRequests.filter(item=>`${item.email} ${item.status} ${(item.files || []).join(" ")}`.toLowerCase().includes(search));
list.innerHTML = requests.length
? requests.map(item=>`
<div class="list-row">
<strong>${item.email}</strong>
<span>Status : ${item.status}</span>
<span>Fichiers : ${item.files.join(", ")}</span>
<small>${item.date}</small>
${(item.images || []).map(image=>`<img class="proof-preview" src="${image.data}" alt="${image.name}">`).join("")}
<div class="row-actions">
<button class="small-btn" data-kyc-valid="${item.id}">Valider</button>
<button class="small-btn danger-btn" data-kyc-reject="${item.id}">Refuser</button>
</div>
</div>
`).join("")
: `<div class="list-row">Aucun KYC</div>`;

document.querySelectorAll("[data-kyc-valid]").forEach(button=>{
button.addEventListener("click",()=>updateKyc(button.dataset.kycValid,"validated"));
});

document.querySelectorAll("[data-kyc-reject]").forEach(button=>{
button.addEventListener("click",()=>updateKyc(button.dataset.kycReject,"rejected"));
});
}

function updateKyc(id,status){
if(!hasPermission("kyc") && !hasPermission("all")){
alert("Permission refusee.");
return;
}

const request = state.kycRequests.find(item=>item.id === id);
const user = state.users.find(item=>item.id === request.userId);
request.status = status;
user.kycStatus = status;
user.verified = status === "validated";
saveState();
addActivity("admin",`${currentUser.email} a ${status} le KYC de ${user.email}`);
renderAdmin();
}

function renderAdminUsers(){
const search = (document.getElementById("adminUserSearch")?.value || "").toLowerCase();
const users = state.users.filter(user=>`${user.firstName} ${user.lastName} ${user.email} ${user.id} ${user.mobileMoney} ${user.location?.lat} ${user.location?.lng}`.toLowerCase().includes(search));
document.getElementById("adminUserList").innerHTML = users.length
? users.map(user=>`
<div class="list-row">
<strong>${user.firstName} ${user.lastName}</strong>
<span>${user.email}</span>
<span>ID : ${user.id}</span>
<span>Mobile Money : ${user.mobileMoney || "-"}</span>
<span>Position : ${user.location ? `${user.location.lat}, ${user.location.lng} (precision ${Math.round(user.location.accuracy || 0)}m)` : "-"}</span>
<span>Solde : ${user.mainBalance} BCC | Recompense : ${user.rewardBalance} BCC</span>
<span>KYC : ${user.kycStatus || "non envoye"}</span>
<span class="status-pill ${user.banned ? "banned" : "active"}">${user.banned ? "banni" : "actif"}</span>
<div class="row-actions">
<button class="small-btn ${user.banned ? "" : "danger-btn"}" data-ban-user="${user.id}">${user.banned ? "Reactiver" : "Bannir"}</button>
</div>
</div>
`).join("")
: `<div class="list-row">Aucun utilisateur</div>`;

document.querySelectorAll("[data-ban-user]").forEach(button=>{
button.addEventListener("click",()=>toggleUserBan(button.dataset.banUser));
});
}

function toggleUserBan(userId){
if(!hasPermission("users") && !hasPermission("all")){
alert("Permission refusee.");
return;
}
const user = state.users.find(item=>item.id === userId);
user.banned = !user.banned;
saveState();
addActivity("admin",`${currentUser.email} a ${user.banned ? "banni" : "reactive"} ${user.email}`);
renderAdmin();
}

function renderAdminFinance(){
const list = document.getElementById("adminFinanceList");
if(!list){
return;
}

const search = (document.getElementById("adminFinanceSearch")?.value || "").toLowerCase();
const withdrawals = state.settings.withdrawals.filter(item=>`${item.email} ${item.userId} ${item.number} ${item.status} ${item.amount}`.toLowerCase().includes(search));
const transactions = state.transactions.filter(item=>`${item.userId} ${item.name} ${item.type} ${item.status} ${item.amount}`.toLowerCase().includes(search));
const proofs = state.missionProofs.filter(proof=>`${proof.email} ${proof.title} ${proof.status} ${proof.gain}`.toLowerCase().includes(search));

list.innerHTML = [
...withdrawals.map(item=>`
<div class="list-row">
<strong>Retrait Mobile Money</strong>
<span>Email : ${item.email}</span>
<span>User ID : ${item.userId}</span>
<span>Numero : ${item.number}</span>
<span>Operateur : ${item.operator}</span>
<span>Montant : ${item.amount} BCC</span>
<span class="status-pill ${item.status}">${item.status}</span>
<small>${item.date}</small>
<div class="row-actions">
<button class="small-btn" data-withdraw-valid="${item.id}">Approuver</button>
<button class="small-btn danger-btn" data-withdraw-reject="${item.id}">Refuser</button>
</div>
</div>
`),
...proofs.map(proof=>`
<div class="list-row">
<strong>Capture mission a verifier</strong>
<span>Email : ${proof.email}</span>
<span>Mission : ${proof.title}</span>
<span>Gain : <span class="gain-green">+${proof.gain} BCC</span></span>
<span class="status-pill ${proof.status}">${proof.status}</span>
${proof.proofImage ? `<img class="proof-preview" src="${proof.proofImage}" alt="Preuve mission">` : ""}
<div class="row-actions">
<button class="small-btn" data-mission-valid="${proof.id}">Valider mission</button>
<button class="small-btn danger-btn" data-mission-reject="${proof.id}">Refuser mission</button>
</div>
</div>
`),
...transactions.map(item=>`
<div class="list-row">
<strong>${item.type}</strong>
<span>User ID : ${item.userId}</span>
<span>Nom : ${item.name}</span>
<span>Montant : ${item.amount} BCC</span>
<span>Frais : ${item.fees} BCC</span>
<span>Status : ${item.status || "valide"}</span>
<small>${item.date}</small>
</div>
`)
].join("") || `<div class="list-row">Aucune transaction</div>`;

document.querySelectorAll("[data-withdraw-valid]").forEach(button=>{
button.addEventListener("click",()=>updateWithdrawal(button.dataset.withdrawValid,"validated"));
});

document.querySelectorAll("[data-withdraw-reject]").forEach(button=>{
button.addEventListener("click",()=>updateWithdrawal(button.dataset.withdrawReject,"rejected"));
});

document.querySelectorAll("[data-mission-valid]").forEach(button=>{
button.addEventListener("click",()=>updateMissionProof(button.dataset.missionValid,"validated"));
});

document.querySelectorAll("[data-mission-reject]").forEach(button=>{
button.addEventListener("click",()=>updateMissionProof(button.dataset.missionReject,"rejected"));
});
}

function updateWithdrawal(id,status){
if(!hasPermission("finance") && !hasPermission("all")){
alert("Permission refusee.");
return;
}
const withdrawal = state.settings.withdrawals.find(item=>item.id === id);
if(!withdrawal || withdrawal.status !== "pending"){
return;
}
const user = state.users.find(item=>item.id === withdrawal.userId);
withdrawal.status = status;
const userTx = user.transactions.find(item=>item.id === id);
if(userTx){
userTx.status = status === "validated" ? "approuve" : "refuse";
userTx.name = status === "validated" ? "Retrait approuve" : "Retrait refuse";
}
if(status === "rejected"){
user.mainBalance += Number(withdrawal.amount);
}
saveState();
addActivity("finance",`${currentUser.email} a ${status} le retrait de ${withdrawal.email}`);
renderAdmin();
}

document.getElementById("missionMaintenanceToggle").addEventListener("change",(event)=>{
if(!hasPermission("maintenance") && !hasPermission("all")){
alert("Permission refusee.");
event.target.checked = state.settings.missionMaintenance;
return;
}

state.settings.missionMaintenance = event.target.checked;
saveState();
addActivity("admin",`${currentUser.email} a mis maintenance missions : ${event.target.checked ? "ON" : "OFF"}`);
renderAdmin();
});

function renderSubAdmins(){
document.getElementById("subAdminList").innerHTML = adminAccounts.filter(admin=>admin.role !== "main_admin").map(admin=>`
<div class="list-row">
<strong>${admin.name}</strong>
<span>Email : ${admin.email}</span>
<span>Mot de passe : ${admin.password}</span>
<span>Taches : ${admin.permissions.join(", ")}</span>
</div>
`).join("");
}

setInterval(updateRewardCountdown,1000);
