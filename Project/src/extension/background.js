chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "uploadSnapshot") {
      fetch("http://localhost:4000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg.data)
      })
        .then(async (res) => {
          const text = await res.text();
          console.log("[Background Upload Response]", text);
        })
        .catch(err => console.error("[Background Upload Failed]", err));
    }
  });