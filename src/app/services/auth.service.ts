import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'https://identitytoolkit.googleapis.com/v1';
  private apikey = 'AIzaSyB-Qbjz6OxvSmLRHOXI5TA7KZC-bSr8y5Q';

  userToken: string;

  // Crear nuevo usuario
  // https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=[API_KEY]


  // Login
  // https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=[API_KEY]

  //Crear nuevos usuarios (el de signUp with email / password)
  //https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]

  //Crear login para autenticar usuarios (el de signIn with email / password)
  //https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]


  constructor( private http: HttpClient ) {
    this.leerToken(); //justo cuando se inicializa el servicio sabremos altiro si lo tenemos o no
  }


  logout() { //es la destrucción de ese token del localStorage que teniamos en guardar
    localStorage.removeItem('token');
  }

  login( usuario: UsuarioModel ) {

    const authData = {
      ...usuario, //email:usuario.email, password:usuario.password, es lo mismo es un atajo
      returnSecureToken: true
    };

    return this.http.post(
      `${ this.url }/accounts:signInWithPassword?key=${ this.apikey }`,
      authData
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] );
        return resp;
      })
    );

  }

  nuevoUsuario( usuario: UsuarioModel ) { 

    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${ this.url }/accounts:signUp?key=${ this.apikey }`,
      authData
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] ); //el idtoken es lo que necesito para validar mis peticiones en el backend, y es lo que debo guardar en mi localStorage cuando lo necesite
        return resp;
      })
    );

  }


  private guardarToken( idToken: string ) {

    this.userToken = idToken;
    localStorage.setItem('token', idToken); //guardo el token en el localStorage

    let hoy = new Date();
    hoy.setSeconds( 3600 );

    localStorage.setItem('expira', hoy.getTime().toString() ); //aqui tengo la fecha en la que se que expirara el token


  }

  leerToken() {

    if ( localStorage.getItem('token') ) {
      this.userToken = localStorage.getItem('token'); //si existe lo obtengo y lo guardo
    } else {
      this.userToken = ''; //sino lo dejo vacío
    }

    return this.userToken;

  }


  estaAutenticado(): boolean {

    if ( this.userToken.length < 2 ) {
      return false; //cuando el token no es valido
    }

    const expira = Number(localStorage.getItem('expira'));
    const expiraDate = new Date();
    expiraDate.setTime(expira); //fecha en la que el token expira especificamente

    if ( expiraDate > new Date() ) {
      return true;
    } else {
      return false; //quiere decir que el token ya expiró
    }


  }


}
