import { EsmFetch } from './EsmFetch.js';

export class EsmRouter {

    constructor() {
        
        this.rootDiv = null;
        this.routes = [];
        this.esmFetch = new EsmFetch();
    }

    async init(routes) {

        this.routes = routes;
        this.render(window.location.hash);
        this.events();
    }

    events() {

        window.onhashchange = (event) => {

            this.render(window.location.hash)
        };
    }

    async render(path) {

        let result = this.routes.find(route => route.url === path.replace(/^#\//, ""));
        
        if (!result) {
            result = {               
                url: 'http404',
                js: '/app/error/Http404.js',
                container: '#root'
            };
        }

        //--> previne perda do parent container após o page reload (ex. F5);
        if(!document.querySelector(result.container)) {
            result = await this.#overrideParent(result);
        }

        await this.setRender(result);

        if (result.sub) {
            this.findObj(result, 'sub');
        }
    }

    async findObj(json, keyToFind) {

        for (const key in json) {
            if (key == keyToFind) {
                for (let rote of json[key]) {
                    await this.setRender(rote);
                    await this.findObj(rote, keyToFind);
                }
            }
        }
    }

    async setRender(result) {
        
        let rootDiv = document.querySelector(result.container);
        let moduleName = result.js.match(/([^\/]+)(?=\.\w+$)/)[0];

        while (rootDiv.firstChild) {
            rootDiv.firstChild.remove();
        }

        const module = await import (`${result.js}`);                      
        const newInstance = new module[moduleName](); 
        let template = newInstance.template();              
            
        await this.esmFetch.getTemplate(`${template.html}`)
            .then((html) => {
                rootDiv.insertAdjacentHTML('afterbegin', html);
            });

        await newInstance.init();

        let hasCss = false;
        if(template.css){
            //await import(`${template.css}`);
            if(document.querySelectorAll("head link")){
                document.querySelectorAll("head link").forEach((element) => {
                    if(element.getAttribute('href').includes('/app/App.css')){
                        hasCss = true;
                    }
                });
            }
            if(!hasCss){
                document.querySelector("head").insertAdjacentHTML(
                    "beforeend", 
                    `<link rel="stylesheet" href="${template.css}" />`
                );
            }
        }
    }

    //-->TODO: Melhorar recursividade
    async #overrideParent(result){

        return this.routes.find((route) => {
            route.sub[0].container == result.container;
            route.sub = [result]; 

            console.log( JSON.stringify(route.sub, null, 4) );

            return route;
        });
    }
}