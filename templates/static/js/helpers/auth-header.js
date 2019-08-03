import Cookies from 'js-cookie';

export function authHeader() {
    console.log(Cookies.get('csrf_access_token'));
    return { 'X-CSRF-TOKEN': Cookies.get('csrf_access_token') };
    // return authorization header with jwt token
    let user = {};
    try{
        user = JSON.parse(sessionStorage.getItem('user'));
    }
    catch (e){
        console.log("exception: ",e);
    }

    if (user && user.token) {
        return { 'X-CSRF-TOKEN': Cookies.get('csrf_access_token') };
        //return { 'Authorization': 'Bearer ' + user.token };
    } else {
        return {};
    }
}

export function authHeaderRefresh() {
    console.log(Cookies.get('csrf_refresh_token'));
    var refreshCookie = Cookies.get('csrf_refresh_token');
    if(refreshCookie==undefined){
        return false;
    }
    else{
        return { 'X-CSRF-TOKEN': refreshCookie };
    }
}