import { SpappFetch } from './SpappFetch.js';

export class SpappRouter {

    constructor() {
        this.rootDiv = null;
        this.routes = [];
        this.spappBind = new SpappFetch();
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
        let result = this.routes.find(route => route.html.url === path.replace(/^#\//, ""));
        if (!result) {
            result = {
                titulo: 'Http404',                
                html: {
                    template: '/app/error/http404.html',
                    url: 'http404'
                },
                container: '#root'
            };
        }
        await this.setRender(result);
        //--> RECURSIVIDADE PARA SUB, SUBU->SUB, SUB->SUB->...
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

        if (!rootDiv) return false;

        while (rootDiv.firstChild) {
            rootDiv.firstChild.remove();
        }

        let template = await this.spappBind.getTemplate(`${result.html.template}`);
        rootDiv.insertAdjacentHTML('afterbegin', this.replaceTemplate(template, result));

        if (result.js) {
            await import (`${result.js.url}`).then((module) => {
                new module[result.js.className]().init();
            });
        }
    }

    replaceTemplate(template, element) {

        if (element.titulo) template = template.replaceAll('{{TITLE}}', element.titulo);
        if (element.js) template = template.replaceAll('{{LABEL}}', element.js.className);
        return template;
    }
}