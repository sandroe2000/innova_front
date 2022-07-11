import { EsmFetch } from "./EsmFetch.js";
//import { JSONPath } from "../node_modules/jsonpath-plus/dist/index-browser-esm.js";

export class EsmScope2 {

    constructor(params){
        this.esmFetch = new EsmFetch();
        this.params = params;
        this.comboList = params.combo;
        this.init(params);
    }

    init(params){

        const elements = document.querySelector(params.form.id).elements;
        for(let element of elements){
            Object.defineProperty(params.model, element.getAttribute('id'), {
                get(){
                    return document.querySelector(`${params.form.id} #${element.getAttribute('id')}`).value;
                },
                set(value){
                    document.querySelector(`${params.form.id} #${element.getAttribute('id')}`).value = value;
                }
            });
        }

        if(!params.combo) return;
        params.combo.forEach(element => {
            if(!element.parent){
                this.combo(element.id);
            }
        });
    }

    async combo(id){

        let parent = '';
        let cbo = this.params.combo.filter(item => item.id == id);
            cbo = cbo[0];
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

    async setModel(params, data){

        Object.entries(params.model).forEach(([k, v]) => {
            Object.entries(data).forEach(([key, val]) => {
                if(k == key){                    
                    params.model[key] = val;
                    return;
                }
            });            
        });

        if(!params.combo) return;
        for(let element of params.combo){
            await this.combo(element.id);
            params.model[element.id] = data[element.id];
        };
    }
}