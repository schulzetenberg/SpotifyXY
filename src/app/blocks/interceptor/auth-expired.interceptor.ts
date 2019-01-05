import { Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenService } from '../../shared/token.service';

export class AuthExpiredInterceptor implements HttpInterceptor {
    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private injector: Injector, private tokenService: TokenService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(request).catch(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            const message = err.error && err.error.error && err.error.error.message;
            if (message === 'The access token expired') {
              console.log('Get a new token, the current one is expired');
              return this.handleTokenExpired(request, next);
            }
          }
        }
      });
    }

    handleTokenExpired(req: HttpRequest<any>, next: HttpHandler) {
      // Use isRefreshingToken to only perform one token call, even if multile requests have come in at the same time
      if (!this.isRefreshingToken) {
        this.isRefreshingToken = true;

        // Reset here so that the following requests wait until the token
        // comes back from the refreshToken call.
        this.tokenSubject.next(null);

        return this.tokenService.getToken(true)
          .switchMap(() => {
              this.tokenSubject.next(true);
              this.isRefreshingToken = false;
              return next.handle(this.addToken(req));
          });
      } else {

        // For subsequent requests, wait for the token to be returned from the first request
        // Once the token is returned to the tokenSubject, update the header and re-request
        return this.tokenSubject
        .filter(token => token === true)
        .take(1)
        .switchMap(() => {
          return next.handle(this.addToken(req));
        });
      }
    }

    addToken(req: HttpRequest<any>): HttpRequest<any> {
      return req.clone({ setHeaders: { Authorization: 'Bearer ' + localStorage.getItem('angular2-spotify-token') }});
    }
}
