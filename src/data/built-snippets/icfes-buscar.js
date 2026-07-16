export function buscar(valor) {
  if (valor.length > 2) {
    const resultados = [];
    for (const string of titulos) {
      if (string.includes(valor.toLowerCase())) {
        resultados.push(string);
      }
    }
    return resultados;
  } else {
    return [];
  }
}

buscador.addEventListener("input", () => {
  limpiarSugerencias();
  for (const element of buscar(buscador.value.toString())) {
    const p = document.createElement("div");
    p.className = "sugerencia";
    p.textContent = element;
    p.addEventListener("click", () => {
      buscador.value = p.textContent;
      generarListado(buscador.value.toLowerCase());
    });
    contBuscador.append(p);
  }
});
