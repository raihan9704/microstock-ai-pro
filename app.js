// =========================
// SIMPAN API KEY
// =========================

const geminiKeyInput =
document.getElementById("geminiKey");

const openaiKeyInput =
document.getElementById("openaiKey");

const providerSelect =
document.getElementById("provider");

const imageUpload =
document.getElementById("imageUpload");

const generateBtn =
document.getElementById("generateBtn");

const saveApiBtn =
document.getElementById("saveApiBtn");

const hasil =
document.getElementById("hasil");

const previewContainer =
document.getElementById("previewContainer");

const fileCount =
document.getElementById("fileCount");

const progressBar =
document.getElementById("progressBar");

const tableBody =
document.querySelector("#metadataTable tbody");

let metadataResults = [];


// =========================
// LOAD API KEY
// =========================

window.onload = () => {

geminiKeyInput.value =
localStorage.getItem("gemini_key") || "";

openaiKeyInput.value =
localStorage.getItem("openai_key") || "";

};


// =========================
// SAVE API KEY
// =========================

saveApiBtn.onclick = () => {

localStorage.setItem(
"gemini_key",
geminiKeyInput.value
);

localStorage.setItem(
"openai_key",
openaiKeyInput.value
);

alert("API Key berhasil disimpan");

};


// =========================
// PREVIEW GAMBAR
// =========================

imageUpload.addEventListener(
"change",
() => {

previewContainer.innerHTML = "";

const files =
imageUpload.files;

fileCount.innerHTML =
files.length +
" File Dipilih";

for(let file of files){

const img =
document.createElement("img");

img.className =
"thumb";

img.src =
URL.createObjectURL(file);

previewContainer.appendChild(img);

}

});


// =========================
// FILE TO BASE64
// =========================

function fileToBase64(file){

return new Promise(
(resolve,reject)=>{

const reader =
new FileReader();

reader.onload =
()=>{

resolve(
reader.result.split(",")[1]
);

};

reader.onerror =
reject;

reader.readAsDataURL(file);

});

}


// =========================
// GEMINI
// =========================

async function generateGemini(
file,
apiKey
){

const base64 =
await fileToBase64(file);

const prompt = `
Analyze this stock image.

Generate:

1. SEO Title
2. SEO Description
3. 49 Keywords
4. Adobe Stock Category

Language: English

Format:

TITLE:
DESCRIPTION:
KEYWORDS:
CATEGORY:
`;

const response =
await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

contents:[{

parts:[

{
text:prompt
},

{
inline_data:{
mime_type:file.type,
data:base64
}
}

]

}]

})

}
);

const data =
await response.json();

return data?.candidates?.[0]
?.content?.parts?.[0]
?.text || "ERROR";

}


// =========================
// GENERATE
// =========================

generateBtn.onclick =
async () => {

const files =
imageUpload.files;

if(files.length===0){

alert(
"Pilih gambar dahulu"
);

return;

}

const provider =
providerSelect.value;

let apiKey = "";

if(provider==="gemini"){

apiKey =
geminiKeyInput.value;

}

if(provider==="openai"){

alert(
"OpenAI akan ditambahkan setelah Gemini selesai."
);

return;

}

if(!apiKey){

alert(
"Masukkan API Key"
);

return;

}

metadataResults = [];

tableBody.innerHTML = "";

hasil.value = "";

for(
let i=0;
i<files.length;
i++
){

const file =
files[i];

hasil.value +=
"Memproses : " +
file.name +
"\n";

try{

const metadata =
await generateGemini(
file,
apiKey
);

metadataResults.push({

filename:
file.name,

metadata

});

const row =
document.createElement("tr");

row.innerHTML = `

<td>${file.name}</td>
<td>${metadata}</td>
<td>-</td>
<td>-</td>
<td>-</td>

`;

tableBody.appendChild(
row
);

hasil.value +=
"✔ Selesai\n\n";

}
catch(err){

hasil.value +=
"❌ Error : " +
err.message +
"\n\n";

}

const percent =
((i+1)/
files.length)
*100;

progressBar.style.width =
percent + "%";

}

alert(
"Semua gambar selesai diproses"
);

};


// =========================
// EXPORT ADOBE CSV
// =========================

document.getElementById(
"adobeBtn"
).onclick = () => {

if(
metadataResults.length===0
){

alert(
"Belum ada metadata"
);

return;

}

let csv =
"Filename,Metadata\n";

metadataResults.forEach(
item=>{

csv +=
`"${item.filename}","${item.metadata.replace(/"/g,'""')}"\n`;

}
);

downloadCSV(
csv,
"adobe_stock.csv"
);

};


// =========================
// EXPORT SHUTTERSTOCK
// =========================

document.getElementById(
"shutterstockBtn"
).onclick = () => {

if(
metadataResults.length===0
){

alert(
"Belum ada metadata"
);

return;

}

let csv =
"Filename,Metadata\n";

metadataResults.forEach(
item=>{

csv +=
`"${item.filename}","${item.metadata.replace(/"/g,'""')}"\n`;

}
);

downloadCSV(
csv,
"shutterstock.csv"
);

};


// =========================
// DOWNLOAD CSV
// =========================

function downloadCSV(
content,
filename
){

const blob =
new Blob(
[content],
{
type:"text/csv"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement("a");

a.href = url;

a.download =
filename;

a.click();

URL.revokeObjectURL(
url
);

}


// =========================
// XLSX
// =========================

document.getElementById(
"xlsxBtn"
).onclick = () => {

alert(
"Versi XLSX menyusul. Gunakan CSV terlebih dahulu."
);

};
