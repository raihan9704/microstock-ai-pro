function simpanApi() {
    const apiKey = document.getElementById("apikey").value;
    localStorage.setItem("microstock_api_key", apiKey);
    alert("API Key berhasil disimpan");
}

window.onload = () => {
    const key = localStorage.getItem("microstock_api_key");
    if (key) {
        document.getElementById("apikey").value = key;
    }
};

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result.split(",")[1]);
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function generateMetadata() {

    const provider =
        document.getElementById("provider").value;

    const apiKey =
        document.getElementById("apikey").value;

    if (!apiKey) {
        alert("Masukkan API Key");
        return;
    }

    const files =
        document.getElementById("imageUpload").files;

    if (files.length === 0) {
        alert("Upload gambar terlebih dahulu");
        return;
    }

    const hasil =
        document.getElementById("hasil");

    hasil.value =
        `Memproses ${files.length} gambar...\n\n`;

    let semuaHasil = [];

    for (let i = 0; i < files.length; i++) {

        const file = files[i];

        try {

            hasil.value +=
                `⏳ ${i + 1}/${files.length} - ${file.name}\n`;

            const base64 =
                await fileToBase64(file);

            const prompt = `
Buat metadata microstock profesional.

Output:

JUDUL:
DESKRIPSI:
49 KEYWORD:
KATEGORI:

Gunakan bahasa Inggris.
`;

            let result = "";

            if (provider === "Gemini") {

                const response =
                    await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [
                                        {
                                            text: prompt
                                        },
                                        {
                                            inline_data: {
                                                mime_type: file.type,
                                                data: base64
                                            }
                                        }
                                    ]
                                }]
                            })
                        }
                    );

                const data =
                    await response.json();

                if (data.error) {
                    throw new Error(data.error.message);
                }

                result =
                    data.candidates?.[0]
                        ?.content?.parts?.[0]
                        ?.text ||
                    "Tidak ada hasil";
            }

            else {

                result =
                    "Provider ini belum diaktifkan.\nGunakan Gemini terlebih dahulu.";
            }

            semuaHasil.push({
                filename: file.name,
                metadata: result
            });

        }

        catch (err) {

            semuaHasil.push({
                filename: file.name,
                metadata: "ERROR : " + err.message
            });
        }
    }

    hasil.value = "";

    semuaHasil.forEach(item => {

        hasil.value +=
            `=========================
FILE : ${item.filename}

${item.metadata}

`;
    });

    localStorage.setItem(
        "metadata_batch",
        JSON.stringify(semuaHasil)
    );

    alert(
        `${files.length} gambar selesai diproses`
    );
}
