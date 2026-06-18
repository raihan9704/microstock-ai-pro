function simpanApi(){

const apiKey =
document.getElementById("apikey").value;

localStorage.setItem(
"microstock_api_key",
apiKey
);

alert("API Key berhasil disimpan");
}

window.onload = () => {

const key =
localStorage.getItem(
"microstock_api_key"
);

if(key){
document.getElementById("apikey").value = key;
}
};
