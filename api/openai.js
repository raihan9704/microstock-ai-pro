export default async function handler(req, res) {

  res.status(200).json({
    status: "success",
    provider: "OpenAI",
    message: "OpenAI API aktif"
  });

}
