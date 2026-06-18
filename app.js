const geminiKeyInput = document.getElementById("geminiKey");
const openaiKeyInput = document.getElementById("openaiKey");
const groqKeyInput = document.getElementById("groqKey");

const providerSelect = document.getElementById("provider");
const imageUpload = document.getElementById("imageUpload");
const generateBtn = document.getElementById("generateBtn");
const saveApiBtn = document.getElementById("saveApiBtn");

const hasil = document.getElementById("hasil");
const previewContainer = document.getElementById("previewContainer");
const fileCount = document.getElementById("fileCount");
const progressBar = document.getElementById("progressBar");

const tableBody =
document.querySelector("#metadataTable tbody");

let metadataResults = [];


// ======================
// LOAD API KEY
// ======================

window.onload = () => {

geminiKeyInput.value =
localStorage.getItem("gemini_key") || "";

openaiKeyInput.value =
localStorage.getItem("openai_key") || "";

groqKeyInput.value =
localStorage.getItem("groq_key") || "";

};


// ======================
// SAVE API KEY
// ======================

saveApiBtn.onclick = () => {

localStorage.setItem(
"gemini_key",
geminiKeyInput.value
);

localStorage.setItem(
"openai_key",
openaiKeyInput.value
);

localStorage.setItem(
"groq_key",
groqKeyInput.value
);

alert("API Key berhasil disimpan");

};


// ======================
// PREVIEW IMAGE
// ======================

imageUpload.addEventListener(
"change",
() => {

previewContainer.innerHTML = "";

const files = imageUpload.files;

fileCount.innerHTML =
files.length + " File Dipilih";

for(const file of files){

const img =
document.createElement("img");

img.className = "thumb";

img.src =
URL.createObjectURL(file);

previewContainer.appendChild(img);

}

});


// ======================
// BASE64
// ======================

function fileToBase64(file){

return new Promise(
(resolve,reject)=>{

const reader =
new FileReader();

reader.onload = ()=>{

resolve(
reader.result.split(",")[1]
);

};

reader.onerror = reject;

reader.readAsDataURL(file);

});

}


// ======================
// GEMINI
// ======================

async function generateGeminiMetadata(
file,
apiKey
){

const base64 =
await fileToBase64(file);

const prompt = `
Analyze this stock image.

Generate:

TITLE:
DESCRIPTION:
49 KEYWORDS:
CATEGORY:

Use English.
Optimized for Adobe Stock.
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
contents:[
{
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
}
]
})
}
);

const data =
await response.json();

if(data.error){

throw new Error(
data.error.message
);

}

return data.candidates?.[0]
?.content?.parts?.[0]
?.text ||
"Metadata tidak ditemukan";

}


// ======================
// GENERATE
// ======================

generateBtn.onclick =
async ()=>{

const files =
imageUpload.files;

if(files.length===0){

alert(
"Pilih gambar dahulu"
);

return;

}

let apiKey = "";

const provider =
providerSelect.value;

if(provider==="gemini"){

apiKey =
geminiKeyInput.value;

}
else if(provider==="openai"){

alert(
"Sementara gunakan Gemini terlebih dahulu."
);

return;

}
else if(provider==="groq"){

alert(
"Sementara gunakan Gemini terlebih dahulu."
);

return;

}

if(!apiKey){

alert(
"Masukkan API Key Gemini"
);

return;

}

hasil.value = "";
tableBody.innerHTML = "";

metadataResults = [];

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
await generateGeminiMetadata(
file,
apiKey
);

metadataResults.push({
filename:file.name,
metadata:metadata
});

const row =
document.createElement("tr");

row.innerHTML = `
<td>${file.name}</td>
<td colspan="4">${metadata}</td>
`;

tableBody.appendChild(
row
);

hasil.value +=
"✔ Berhasil\n\n";

}
catch(err){

hasil.value +=
"❌ " +
err.message +
"\n\n";

}

const percent =
((i+1) /
files.length)
* 100;

progressBar.style.width =
percent + "%";

}

alert(
"Proses selesai"
);

};


// ======================
// EXPORT CSV
// ======================

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
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = url;
a.download = filename;

document.body.appendChild(a);

a.click();

document.body.removeChild(a);

URL.revokeObjectURL(url);

}


// ======================
// ADOBE CSV
// ======================

document.getElementById(
"adobeBtn"
).onclick = ()=>{

if(
metadataResults.length===0
){

alert(
"Belum ada data"
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


// ======================
// SHUTTERSTOCK CSV
// ======================

document.getElementById(
"shutterstockBtn"
).onclick = ()=>{

if(
metadataResults.length===0
){

alert(
"Belum ada data"
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


// ======================
// XLSX
// ======================

document.getElementById(
"xlsxBtn"
).onclick = ()=>{

alert(
"Gunakan Export CSV terlebih dahulu"
);

};
