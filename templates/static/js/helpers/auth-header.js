import Cookies from 'js-cookie';

export function authHeader() {
    // return authorization header with jwt token from cookie
    return { 'X-CSRF-TOKEN': Cookies.get('csrf_access_token') };
}

export function authHeaderRefresh() {
    var refreshCookie = Cookies.get('csrf_refresh_token');
    if(refreshCookie==undefined){
        return false;
    }
    else{
        return { 'X-CSRF-TOKEN': refreshCookie };
    }
}