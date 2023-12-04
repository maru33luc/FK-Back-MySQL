import { LoginService } from 'src/app/services/login.service';
import { Component } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { FunkosService } from 'src/app/services/funkos.service';
import { CartLocalService } from 'src/app/services/cart-local.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ItemCart, FunkoCart } from 'src/app/interfaces/Cart';
import { User } from 'src/app/interfaces/User';

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
    ) {}

    ngOnInit() {
        this.loginService.authStateObservable()?.subscribe(async (user) => {
            if (user) {
                this.user = this.loginService.authStateObservable();
                await this.obtenerCart(user.id?.toString() ?? '');
            } else {
                this.user = undefined;
                this.cartItems = [];
                this.cartItems = await this.cartLocalService.getCart();
                await this.loadFunkoDetails();
            }
        });
        this.cartLocalService.cartSubject.subscribe(async (items) => {
            if (this.user == undefined) {
                this.cartItems = items;
                await this.loadFunkoDetails();
            }
        });
    }

    async obtenerCart(uid: string) {
        const res = await this.cartService.obtenerCarritoDeCompras(parseInt(uid));
        if (res) {
            const carrito = res as ItemCart[];
            carrito.forEach((item) => {
                this.cartItems.push({ funkoId: item.id_funko, quantity: item.cantidad });
                this.cartItemsId.push(item.id_funko);
            });
            await this.loadFunkoDetails();
        } return null;
    }

    async loadFunkoDetails() {
        this.cartItemsCopy = []; // Clear the array before populating it again
        console.log('cartItems', this.cartItems);
    
        // Use a Map to track unique items based on funkoId
        const uniqueItemsMap = new Map<number, any>();
    
        for (const item of this.cartItems) {
            try {
                const funko: any | undefined = await this.funkoService.getFunko(item.funkoId);
                if (funko) {
                    const itemACopiar = { ...funko, quantity: item.quantity };
    
                    // Use funkoId as the key to ensure uniqueness
                    uniqueItemsMap.set(item.funkoId, itemACopiar);
    
                    console.log('itemACopiar', itemACopiar);
                } else {
                    console.log('Item not found:', item);
                }
            } catch (error) {
                console.error('Error loading details for item:', item, error);
            }
        }
    
        // Convert the Map values back to an array
        this.cartItemsCopy = Array.from(uniqueItemsMap.values());
    
        console.log('cartItemsCopy', this.cartItemsCopy);
    }
    

    async increaseQuantity(item: any) {
        if (this.user) {
            const user = await this.loginService.authStateObservable()?.toPromise(); // Convert Observable to Promise
            if (user && user.id) {
                const res = await this.cartService.actualizarCantidades(user.id, this.cart.id, item.funkoId, 1);
                if (res) {
                    item.quantity++;
                }
            }
        } else {
            this.cartLocalService.updateCartItem({ funkoId: item.funkoId, quantity: item.quantity + 1 });
            item.quantity++;
        }
    }
    async decreaseQuantity(item: any) {
        if (item.quantity > 0) {
            if (this.user) {
                const user = await this.loginService.authStateObservable()?.toPromise(); // Convert Observable to Promise
                if (user && user.id) {
                    const res = await this.cartService.actualizarCantidades(user.id, this.cart.id, item.funkoId, 1);
                    if (res) {
                        item.quantity--;
                    }
                }
            } else {
                this.cartLocalService.updateCartItem({ funkoId: item.funkoId, quantity: item.quantity - 1 });
                item.quantity--;
            }
        }
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
                        this.cartService.eliminarDelCarrito(user.id, this.cart.id);
                        this.cartItems = this.cartItems.filter((cartItem) => cartItem !== item);
                    }
                } else {
                    this.cartLocalService.removeFromCart(item.id);
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