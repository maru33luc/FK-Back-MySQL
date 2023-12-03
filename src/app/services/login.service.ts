import { Injectable } from '@angular/core';
import {
    Auth, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, getAuth, sendPasswordResetEmail
} from '@angular/fire/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { FunkoCart } from '../interfaces/Cart';
import { Observable } from 'rxjs';
import { User } from '../interfaces/User';
import { environments } from 'src/environments/environments';
import axios from 'axios';


@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private authState$: Observable<any> | undefined;
    urlAuth = environments.urlUsersData;

    constructor(private auth: Auth) {
        this.initialize();
        // Crea un observable personalizado para el estado de autenticación
        this.authState$ = new Observable((observer) => {
            this.auth.onAuthStateChanged(observer);
        });
    }

    private initialize(): void {
        window.addEventListener('unload', this.onUnload.bind(this));
    }

    // Define un método para obtener el observable del estado de autenticación
    authStateObservable(): Observable<any> | undefined {
        return this.authState$;
    }

    async getUsers(): Promise<User[] | undefined> {
        try {
            const response = await axios.get(this.urlAuth);
            return response.data;
        }
        catch (e) {
            console.log(e);
        }
        return undefined;
    }

    async register(email: string, password: string, nombre: string, apellido: string) {
        let lenght = 0;
        try {
            const users = await this.getUsers();
            if (users) {
                const userFound = users.find((user) => user.email === email);
                lenght = users.length;
                if (userFound) {
                    throw new Error('El usuario ya existe');
                }
            }
            try {
                const user: User = {
                    id: lenght + 1,
                    name: nombre,
                    last_name: apellido,
                    email: email,
                    password: password,
                    isAdmin: false
                };
                const userCredential = await axios.post(this.urlAuth, user);
                alert('Usuario registrado con éxito');
            } catch (error) {
                alert('No se pudo registrar el usuario')
            }

        } catch (error) {
            alert('No se pudo obtener la lista de usuarios');
        }

    }

    async login(email: string, password: string) {
        try {
            const userCredential = {
                email: email,
                password: password
            }

            const user = await axios.post(`${this.urlAuth}/auth`, userCredential, { withCredentials: true });
            if (user) {
                window.location.href = '/home';
            } else {
                alert('No se pudo iniciar sesión');
                window.location.href = '/login';
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async logout() {
        try {
            const res = await axios.post(`${this.urlAuth}/logout`, {}, { withCredentials: true });
            if (res) {
                window.location.href = '/home';
                alert('Sesión cerrada con éxito');
            } else {
                alert('No se pudo cerrar sesión');
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getDataActualUser() {
        const user = getAuth().currentUser;
        if (user) {
            try {
                const db = getFirestore();
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                return docSnap.data();
            }
            catch (error) {
                console.log(error);
                return error;
            }
        } return null;
    }

    private onUnload(): void {
        this.logout();
    }

    async getUserName() {
        const user = getAuth().currentUser;
        if (user) {
            try {
                const db = getFirestore();
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                return docSnap.data()?.['nombre'];
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    async updateDataUser(nombre: string, apellido: string, carrito: FunkoCart[]) {
        const user = getAuth().currentUser;
        if (user) {
            try {
                const db = getFirestore();
                const docRef = doc(db, 'users', user.uid);
                const payload = {
                    nombre: nombre,
                    apellido: apellido,
                    carrito: carrito
                }
                const docSnap = await setDoc(docRef, payload);
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    isUserLoggedIn(): boolean {
        const user = getAuth().currentUser;
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    getInfoUsuarioLogueado() {
        this.authStateObservable()?.subscribe((user) => {
            if (user) {
                return user;
            } else {
                return null;
            }
        });
    }

    isAdmin(): Observable<boolean> {
        return new Observable((observer) => {
            this.authStateObservable()?.subscribe((user) => {
                if (user) {
                    const db = getFirestore();
                    const docRef = doc(db, 'users', user.uid);
                    getDoc(docRef)
                        .then((docSnap) => {
                            if (docSnap.data()?.['isAdmin']) {
                                observer.next(true);
                            } else {
                                observer.next(false);
                            }
                            observer.complete();
                        })
                        .catch((error) => {
                            observer.error(error);
                        });
                } else {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }

    async resetPassword(email: string) {
        try {
            await sendPasswordResetEmail(this.auth, email);
        } catch (error) {
            console.error('Error al enviar el correo de restablecimiento de contraseña', error);
            throw error;
        }
    }
}