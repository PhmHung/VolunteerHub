self.addEventListener("push", (event) => {
  console.log("Push received:", event.data?.text());

  const data = event.data ? JSON.parse(event.data.text()) : {};

  console.log(data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827318.png",
    })
  );
});
