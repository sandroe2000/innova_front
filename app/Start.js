import { EsmRouter } from '/esm-core/EsmRouter.js';

export class Start {

    async init() {

        new EsmRouter()
            .init([
                {
                    url: "",
                    js: "/app/login/Login.js",
                    container: '#root',
                },{
                    url: 'crm',
                    js: '/app/crm/Crm.js',
                    container: '#root',               
                    sub:[
                        {
                            url: 'pessoa',
                            js: '/app/crm/pessoa/Pessoa.js',
                            container: '#containerPessoa',            
                        },{
                            url: 'manifestacao',
                            js: '/app/crm/manifestacao/Manifestacao.js',
                            container: '#containerManifestacao',            
                        }
                    ]
                }
            ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Start().init();
});