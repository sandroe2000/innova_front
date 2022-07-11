import { EsmScope } from '/esm-core/EsmScope.js';
import { EsmFetch } from '/esm-core/EsmFetch.js';

export class Login {

    constructor(){
        this.params = {
            form: { 
                id: '#frmLogin'
            },
            model: {
                username: 'mariane',
                password: 'Inn*v@01'
            }
        };
    }

    template(){
        return {
            html: '/app/login/login.html'
        }
    }

    init(){
        new EsmScope(this.params);
        this.events();
    }

    events(){

        document.querySelector('#btnLogin').addEventListener('click', async (event) => {

            /*let json = {
                username: document.querySelector('#username').value,
                password: document.querySelector('#password').value
            };*/
            if(await new EsmFetch().setLogin('/api/login', this.params.model)){
                location.href="/#/crm";
            }
        }, false);
    }
}