import { LoginService } from 'src/app/services/login.service';
import { Component } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { FunkosService } from 'src/app/services/funkos.service';
import { CartLocalService } from 'src/app/services/cart-local.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ItemCart, FunkoCart } from 'src/app/interfaces/Cart';
import { User } from 'src/app/interfaces/User';
import { Funko } from 'src/app/interfaces/Funko';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent {
    cartItems: FunkoCart[] = [];
    cartItemsCopy: any[] = [];
    cartItemsId: number[] = [];
    user: Observable<User> | undefined;
    cart: any;
    quantityChanges: any;
    valoresPrevios: any;

    constructor(
        private cartService: CartService,
        private funkoService: FunkosService,
        private loginService: LoginService,
        private cartLocalService: CartLocalService,
    ) { }

    ngOnInit() {

        this.loginService.authStateObservable()?.subscribe(async (user) => {
            if (user) {
                if (user.id) {
                    console.log('userLogueado?', user);
                     await this.obtenerCart(user.id.toString()); 
                }
            } else {
                console.log('user no logueado', user);
                this.user = undefined;
                this.cartItems = [];
                this.cartItems = await this.cartLocalService.getCart();
                await this.loadFunkoDetails();
                this.cartLocalService.cartSubject.subscribe(async (items) => {
                    this.cartItems = items;
                    await this.loadFunkoDetails();
                });
            }
        }
        );
        
    }

    async obtenerCart(uid: string) {
        const res = await this.cartService.obtenerCarritoDeCompras(parseInt(uid));
        console.log('res', res);
        if (res) {
            console.log('carrito en cart component', res);
            const carrito = res as ItemCart[];
            console.log('type of carrito', typeof carrito);
            carrito.forEach((item) => {
                this.cartItems.push({ funkoId: item.id_funko, quantity: item.cantidad });
                this.cartItemsId.push(item.id_funko);
            });
            await this.loadFunkoDetails();
            return this.cartItems;
        }return null;
    }

    async loadFunkoDetails() {
        for (const item of this.cartItems) {
            try {
                const funko: Funko | undefined = await this.funkoService.getFunko(item.funkoId);
                if (funko) {
                    let itemCopy = { ...item, ...funko };
                    itemCopy.quantity = item.quantity;
                    this.cartItemsCopy.push(itemCopy);
                    
                } else {
                    console.log('Item not found:', item);
                }
            } catch (error) {
                console.error('Error loading details for item:', item, error);
            }
        }
        
    }

    async increaseQuantity(funkoId: number | undefined) {
        if (funkoId) { // Fix 1: Add null check for funkoId
            const funko = await this.funkoService.getFunko(funkoId);
            let stock = funko?.stock;
            if (stock && stock > 0) {
                const user = await this.loginService.authStateObservable()?.toPromise(); // Fix 2: Convert Observable to Promise
                if (user && user.id) { // Fix 3: Add null check for user.id
                    const res = await this.cartService.actualizarCantidades(
                        user.id, // Provide the idUser argument
                        this.cart.id, // Provide the idCart argument
                        funkoId, // Provide the idItem argument
                        1 // Provide the quantity argument
                    );
                }
            }
        }
    }
    async decreaseQuantity(funkoId: number | undefined) {
        if (funkoId) { // Fix 1: Add null check for funkoId
            const user = await this.loginService.authStateObservable()?.toPromise(); // Fix 2: Convert Observable to Promise
            if (user && user.id) { // Fix 3: Add null check for user.id
                const res = await this.cartService.actualizarCantidades(
                    user.id, // Provide the idUser argument
                    this.cart.id, // Provide the idCart argument
                    funkoId, // Provide the idItem argument
                    -1 // Provide the quantity argument
                );
            }
        }
        
    }

    async saveChangesToDatabase() {
        if (this.user) {
            return;

        } else {
            for (const change of this.quantityChanges) {
                const cartItem = this.cartItems.find(item => item.funkoId === change.funkoId);
                if (cartItem) {
                    cartItem.quantity = change.quantity;
                    await this.cartLocalService.updateCartItem({ funkoId: change.funkoId, quantity: change.quantity });
                }
            }
            // Actualizar el stock después de haber actualizado las cantidades en el carrito
            for (const change of this.quantityChanges) {
                let diferenciaCantidad = 0;
                const valorPrevio = this.valoresPrevios.find((item: { funkoId: any; }) => item.funkoId === change.funkoId)?.quantity;
                if (valorPrevio) {
                    diferenciaCantidad = change.quantity - valorPrevio;

                    // Actualizar el stock aquí para usuarios no logueados
                    const funko = await this.funkoService.getFunko(change.funkoId);
                    if (funko) {
                        funko.stock -= diferenciaCantidad;
                        await this.funkoService.putFunko(funko, funko.id);
                    }

                }
                // actualizar la nueva cantidad del item en valoresPrevios
                const valorPrevioActualizado = this.valoresPrevios.find((item: { funkoId: any; }) => item.funkoId === change.funkoId);
                if (valorPrevioActualizado) {
                    valorPrevioActualizado.quantity = change.quantity;
                }
            }
        }
        this.quantityChanges = [];
    }

    calculateTotalPrice(item: any): number {
        return item.price * item.quantity;
    }

    removeItem(item: any) {
        Swal.fire({
            text: "¿Está seguro de eliminar este producto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ELIMINAR",
            cancelButtonText: "CANCELAR"
        }).then(async (result) => {
            if (result.isConfirmed) {
                if (this.user) {
                    const user = await this.loginService.authStateObservable()?.toPromise(); // Convert Observable to Promise
                    if (user && user.id) {
                        this.cartService.eliminarDelCarrito(user.id, this.cart.id); // Remove the 'this.cart.id' argument
                        this.cartItems = this.cartItems.filter((cartItem) => cartItem !== item);
                    }
                } else {
                    this.cartLocalService.removeFromCart(item.funkoId);
                    this.cartItems = this.cartItems.filter((cartItem) => cartItem !== item);
                }
            }
        });
    }

    getTotalQuantity(): number {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal(): number {
        // return this.cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
        return 1;
    }

    getTotalPrice(): number {
        return this.getSubtotal();
    }
}