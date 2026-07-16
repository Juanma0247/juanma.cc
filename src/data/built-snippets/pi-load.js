async function getData(src) {
  await fetch(`./src/${src}`)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar el archivo');
      return res.text();
    })
    .then(num => {
      document.querySelector(".number").textContent = num;
    });
}

// 100k · 1M · 10M · 100M · 1B decimal places, served as static text
getData("10m.txt");
