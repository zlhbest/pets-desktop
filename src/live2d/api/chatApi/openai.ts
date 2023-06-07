export async function chatCompletion(token: string, message: string, callback: (text:string)=>void) {
  await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    }),
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((response) => {
    const reader = response.body.getReader();
    reader.read().then(({ done, value }) => {
      if (done) {
        return;
      }
      const decoded = new TextDecoder().decode(value);
      const decodedArray = decoded.split("data: ");
      decodedArray.forEach((decoded) => {
        if (decoded !== "") {
          if (decoded.trim() === "[DONE]") {
            return;
          } else {
            const response = JSON.parse(decoded).choices[0].message.content
              ? JSON.parse(decoded).choices[0].message.content
              : "";
            callback(response) 
          }
        }
      });
    });
  });
}
