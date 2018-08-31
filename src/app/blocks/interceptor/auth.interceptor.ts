import { Observable } from 'rxjs';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

export class AuthInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('angular2-spotify-token');

        if (!!token) {
            request = request.clone({
                setHeaders: {
                    'Authorization': 'Bearer ' + localStorage.getItem('angular2-spotify-token'),
                    'Content-Type': 'application/json'
                }
            });
        }

        return next.handle(request);
    }
}
