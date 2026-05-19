const socket = io();


socket.on('productsUpdate', (productsData) => {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';


    const productsList = productsData.payload || productsData;

    productsList.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <h3>${product.title}</h3>
            <p>Precio: $${product.price}</p>
            <p>Código: ${product.code}</p>
            <button class="btn" style="background: red;" onclick="deleteProduct('${product._id}')">Eliminar</button>
        `;
        container.appendChild(div);
    });
});


document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value
    };

    socket.emit('addProduct', newProduct);
    e.target.reset();
});


window.deleteProduct = (productId) => {
    socket.emit('deleteProduct', productId);
};
