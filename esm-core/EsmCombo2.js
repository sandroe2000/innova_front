import { EsmFetch } from './EsmFetch.js';

export class EsmCombo2 {

    constructor(params){
        this.params = params;
        this.esmFetch = new EsmFetch();
        this.init();
    }

    init(){

        this.params.combo.forEach(element => {
            if(!element.parent){
                this.combo(element);
            }
        });
    }

    async combo(cbo){

        let parent = '';

        if(!cbo) return false;

        if(cbo.parent){
            parent = '/'+document.querySelector(`#${cbo.parent}`).value;
        }

        let url = cbo.url.concat(parent);
        let data = await this.esmFetch.getData(encodeURI(url), '');
        let combo = document.querySelector(`#${cbo.id}`);
        let result = '';

        document.querySelectorAll(`#${cbo.id} option`).forEach(option => option.remove());

        let opt = document.createElement("OPTION");
            opt.setAttribute('value', '');
            opt.textContent = 'Selecione';
            combo.appendChild(opt);

        if(data && data.content.length > 0){
            data.content.forEach(element => {
                let opt = document.createElement("OPTION");
                    opt.setAttribute('value', `${element[cbo.value]}`.toUpperCase());
                    opt.textContent = element[cbo.text].toUpperCase();
                    combo.appendChild(opt);
            });

            if(cbo.parent){
                let index = 0;
                for(let option of combo.options){
                    if(option.text == this.params.model[cbo.id]){
                        index = option.index;
                    }
                }
                combo.selectedIndex = index;
                result = combo.value;
            }
        }

        return result;
    }

    async comboSequencia(){

        for( let element of this.params.combo){  

            if(element.parent){
             
                await this.combo(element);
            }
        };
    }
}