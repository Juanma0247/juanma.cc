// Home-made "component engine": one call renders a full CRUD table wired
// to a Firestore collection — no framework, just the DOM.
export async function addTablaCRUD(colection, db, nombreEdit, form, contenedor) {
  const crudCont = document.createElement("div");
  crudCont.classList.add("crudCont");

  const h3 = document.createElement("h3");
  h3.textContent = colection.replace(/\b[a-z]/g, (letra) => letra.toUpperCase());

  const buttonAdd = document.createElement("button");
  buttonAdd.textContent = `Añadir ${colection}`;
  buttonAdd.addEventListener("click", () => addFormEdit(nombreEdit, form, null, colection, db));

  const registros = await getCollection(colection, db);
  for (const registro of registros) {
    // ...one editable / deletable row per document
  }
}
