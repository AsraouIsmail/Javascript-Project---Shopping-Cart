//declaring variables
const cartBtn = document.querySelector('.cart-btn');
const CloseCartBtn = document.querySelector('.close-cart');
const ClearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');


let cart = [];

let buttonsDom = [];

//getting the products
class Products {
    async getProducts(){
     try {
         let result = await fetch('products.json')
         let data = await result.json();
        let products = data.items;
        products = products.map(item =>{
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return { title, price, id, image };
        });
        return products;
         
     } catch (error) {
         console.log(error)
         
     }
        
    }

}

//display products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
             <!--single product-->
            <article class="product">
                <div class="img-container">
                    <img class="product-img" src=${product.image}>
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>
            <!--end of single product-->
            `;
        });

        productsDom.innerHTML = result;
    }

    getBugButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDom = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
                
            } else{
                button.addEventListener('click', (event)=>{
                    event.target.innerText = 'In Cart';
                    event.target.disabled = true;

                    //get product from products

                let cartItem = {...Storage.getProduct(id), amount:1 };
                 //add product to the cart

                cart = [...cart, cartItem];
                   
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values
                    this.setCartValues(cart);
                    //display cart items
                    this.addCartItem(cartItem);
                    //show the cart
                    this.showCart();

                });
            }
        })
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map( item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    //display cart items

    addCartItem(item){
       const div = document.createElement('div');
       div.classList.add('.cart-item');
       div.innerHTML = `<!-- cart item -->
            <!-- item image -->
            <img src=${item.image} alt="product" />
            <!-- item info -->
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <!-- item functionality -->
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          <!-- cart item -->
       `;
       cartContent.append(div);

    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('show-cart');

    }

    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        CloseCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
        
    }

    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDom.classList.remove("show-cart");
    }

}

//local Storage
class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));

        return products.find(product => product.id === id);
    }

    static saveCart(){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? 
        JSON.parse(localStorage.getItem('cart'))
        :[];
    }

}

document.addEventListener("DOMContentLoaded", () =>{
    const ui = new UI();
    const products = new Products();

    //setup app
    ui.setupApp()

    //get all products
    products.getProducts().then(Products => {
    ui.displayProducts(Products)
    Storage.saveProducts(Products);
})
.then(() =>{
    ui.getBugButtons();

});
    
});