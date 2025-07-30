import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config (sin Storage)
const firebaseConfig = {
  apiKey: "AIzaSyDlprMxfLhMPMHeJ44oaeVj1Tqzw_s49Yo",
  authDomain: "productos-81877.firebaseapp.com",
  projectId: "productos-81877",
  storageBucket: "productos-81877.firebasestorage.app",
  messagingSenderId: "954928343229",
  appId: "1:954928343229:web:29e77c86a7846c5794efd4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("producto-form");
const contenedor = document.getElementById("productos-container");
const buscador = document.getElementById("buscador");

let productos = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = form["id"].value;
  const nombre = form["nombre"].value;
  const codigo = form["codigo"].value;
  const cantidad = parseInt(form["cantidad"].value);
  const compra = parseFloat(form["precioCompra"].value);
  const venta = parseFloat(form["precioVenta"].value);
  const ganancia = ((venta - compra) * 0.79).toFixed(2);
  const archivo = form["foto"].files[0];

  let urlFoto = "";

  if (archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", "productos");
    formData.append("folder", "productos");

    const res = await fetch("https://api.cloudinary.com/v1_1/dlrbwgtfa/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    urlFoto = data.secure_url;
  }

  const datos = { nombre, codigo, cantidad, compra, venta, ganancia, foto: urlFoto };

  if (id) {
    const refDoc = doc(db, "productos", id);
    await updateDoc(refDoc, datos);
  } else {
    await addDoc(collection(db, "productos"), datos);
  }

  form.reset();
  form["id"].value = "";
  cargarProductos();
});

async function cargarProductos() {
  const querySnapshot = await getDocs(collection(db, "productos"));
  productos = [];
  querySnapshot.forEach((docSnap) => {
    productos.push({ id: docSnap.id, ...docSnap.data() });
  });
  mostrarProductos(productos);
}

function mostrarProductos(lista) {
  contenedor.innerHTML = "";
  lista.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${prod.foto || 'https://via.placeholder.com/200x150'}" />
      <h3>${prod.nombre}</h3>
      <p><strong>Código:</strong> ${prod.codigo || '-'}</p>
      <p><strong>Cantidad:</strong> ${prod.cantidad}</p>
      <p><strong>Compra:</strong> $${prod.compra}</p>
      <p><strong>Venta:</strong> $${prod.venta}</p>
      <p><strong>Ganancia:</strong> $${prod.ganancia}</p>
      <button onclick="editar('${prod.id}')">✏️ Editar</button>
      <button onclick="eliminar('${prod.id}')">🗑️ Eliminar</button>
    `;
    contenedor.appendChild(div);
  });
}

window.editar = (id) => {
  const p = productos.find(p => p.id === id);
  form["id"].value = p.id;
  form["nombre"].value = p.nombre;
  form["codigo"].value = p.codigo;
  form["cantidad"].value = p.cantidad;
  form["precioCompra"].value = p.compra;
  form["precioVenta"].value = p.venta;
};

window.eliminar = async (id) => {
  await deleteDoc(doc(db, "productos", id));
  cargarProductos();
};

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    (p.codigo && p.codigo.toLowerCase().includes(texto))
  );
  mostrarProductos(filtrados);
});

cargarProductos();
