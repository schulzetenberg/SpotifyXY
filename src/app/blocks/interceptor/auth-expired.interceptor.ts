import { Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export class AuthExpiredInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap(
                (event: HttpEvent<any>) => {},
                (err: any) => {
                    if (err instanceof HttpErrorResponse) {
                        if (err.status === 401) {
                          console.log('I see a 401 from the interceptor', err);
                          const message = err.error && err.error.error && err.error.error.message;
                          if (message === 'The access token expired') {
                            console.log('Get new token');
                            // TODO: this.tokenService.getNewToken();
                            // TODO: retry request
                          }
                        }
                    }
                }
            )
        );
    }
}
