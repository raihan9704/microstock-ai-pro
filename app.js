async function generateMetadata() {

    const apiKey =
    document.getElementById("apikey").value;

    if (!apiKey) {
        alert("Masukkan API Key Gemini");
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

        hasil.value +=
        `⏳ ${i+1}/${files.length} - ${file.name}\n`;

        try {

            const base64 =
            await fileToBase64(file);

            const prompt = `
Analyze this stock image.

Generate:
1. SEO Title
2. SEO Description
3. 49 Stock Keywords
4. Adobe Stock Category

Return plain text.
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
            });

            const data =
            await response.json();

            const result =
            data.candidates?.[0]
            ?.content?.parts?.[0]
            ?.text ||
            "Metadata gagal dibuat";

            semuaHasil.push({
                filename:file.name,
                metadata:result
            });

        } catch(err){

            semuaHasil.push({
                filename:file.name,
                metadata:"ERROR"
            });
        }
    }

    hasil.value = "";

    semuaHasil.forEach(item => {

        hasil.value +=
`========================
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
