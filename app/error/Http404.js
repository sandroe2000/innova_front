export class Http404 {

    template(){
        return {
            html: '/app/error/http404.html'
        }
    }

    init(){
        console.log('404...');
    }
}