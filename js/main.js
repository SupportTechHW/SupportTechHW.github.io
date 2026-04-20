import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let productos = [];
let categoriaActual = "todos";

const firebaseConfig = {
    apiKey: "AIzaSyA_cayzQ7lL2YkEkE2bdsq846VKbQHMiaw",
    authDomain: "support-tech-hw.firebaseapp.com",
    projectId: "support-tech-hw",
    storageBucket: "support-tech-hw.firebasestorage.app",
    messagingSenderId: "464304542932",
    appId: "1:464304542932:web:68716def6c1e01c602d741",
    measurementId: "G-MXEFS8LZ3W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function obtenerProductos() {
    const querySnapshot = await getDocs(collection(db, "productos"));

    productos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    productos.sort((a, b) => a.titulo.localeCompare(b.titulo));

    cargarProductos(productos);
}

obtenerProductos();

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const numerito = document.querySelector("#numerito");

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {

        botonesCategorias.forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        categoriaActual = e.currentTarget.id;

        if (categoriaActual !== "todos") {
            const filtrados = productos.filter(p => p.categoria === categoriaActual);
            cargarProductos(filtrados);
        } else {
            cargarProductos(productos);
        }
    });
});

function cargarProductos(productosElegidos) {

    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {

        const enCarrito = productosEnCarrito.find(p => p.id === producto.id);
        const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
        const stockDisponible = producto.stock - cantidadEnCarrito;

        const div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                
                ${stockDisponible > 0 
                    ? `<button class="producto-agregar" id="${producto.id}">Agregar</button>` 
                    : `<button class="producto-agregar agotado" id="${producto.id}">Agotado</button>`
                }
            </div>
        `;

        contenedorProductos.append(div);
    });

    actualizarBotonesAgregar();
}

function actualizarBotonesAgregar() {
    const botones = document.querySelectorAll(".producto-agregar");

    botones.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

actualizarNumerito();

function agregarAlCarrito(e) {

    const id = e.currentTarget.id;

    const producto = productos.find(p => p.id == id);
    const productoExistente = productosEnCarrito.find(p => p.id == id);

    if (e.currentTarget.classList.contains("agotado")) {
        Toastify({
            text: "No hay más en Almacén",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #4b0909, #ff4545)",
                borderRadius: "2rem",
                textTransform: "uppercase",
                fontSize: "1.1rem",
            },
            offset: {
                x:'1.5rem',
                y:'1.5rem'
            },
            onClick: function(){}
        }).showToast();
        return;
    }

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        productosEnCarrito.push({
            id: producto.id,
            titulo: producto.titulo,
            precio: producto.precio,
            imagen: producto.imagen,
            stock: producto.stock,
            cantidad: 1
        });
    }

    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #09204b, #45caff)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: "1.1rem",
        },
        offset: {
            x:'1.5rem',
            y:'1.5rem'
        },
        onClick: function(){}
    }).showToast();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    actualizarNumerito();

    if (categoriaActual === "todos") {
        cargarProductos(productos);
    } else {
        const filtrados = productos.filter(p => p.categoria === categoriaActual);
        cargarProductos(filtrados);
    }
}

function actualizarNumerito() {
    const total = productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0);
    numerito.innerText = total;
}