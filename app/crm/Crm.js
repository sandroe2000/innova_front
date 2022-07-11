import { EsmFetch } from '/esm-core/EsmFetch.js';

import { CadPublico } from '/app/crm/cadastro/publico/CadPublico.js';

export class Crm {

    constructor(){
        this.esmFetch = new EsmFetch();
        this.cadPublico = new CadPublico();
    }

    template(){
        return {
            html: '/app/crm/crm.html'
        }
    }

    async domain(){
        return {
            id: 0,
            protocolo: '',
            idPessoa: 0,
            manifestacoes: [{
                id:0
            }]
        };
    }

    async init(){      
        await this.esmFetch.loadModule(this.cadPublico, '#containerModal');
        //-> MENU DA APPLICAÇÃO
        App.init();
    }
    
}