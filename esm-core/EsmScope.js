import { EsmFetch } from "./EsmFetch.js";
import { JSONPath } from "../node_modules/jsonpath-plus/dist/index-browser-esm.js";

export class EsmScope {

    constructor(params){
        this.model = null;
        this.esmFetch = new EsmFetch();
        this.init(params);
    }

    init(params){
        //CHANGE MODEL VALUE -> SET VALUE INTO FORM
        this.model = new Proxy(params.model, {
            set: async (target, prop, val) => {
                target[prop] = val;
                let elements = document.querySelector(params.form.id).elements;
                for (let element of elements) {
                    if (element.hasAttribute('id') && element.getAttribute('id').split('.')[0]==prop) {
                        if (['textarea', 
                            'text', 
                            'email', 
                            'password', 
                            'number'].includes(element.getAttribute('type'))
                        ) {
                            this.isObject(element, val);
                        }
                       
                        if (['checkbox', 'radio'].includes(element.getAttribute('type'))) {
                            if(Array.isArray(val)){
                                val.forEach(value => {
                                    if(value==element.value){
                                        element.checked = val ? true : false;
                                    }
                                });
                            }else{
                                element.checked = val ? true : false;
                            }
                        }
  
                        if (element.getAttribute('type') == 'date') {
                            element.value = val.split('/').reverse().join('-');
                        } else if (element.getAttribute('type') == 'datetime-local') {
                            element.value = val.split('/').reverse().join('-') + ' 00:00';
                        }

                        if (element.type == 'select-one') {
                            //TODO: VALIDAR SINCRONIA DE CARREGAMENTO: PARENT -> CHILD
                            await this.isObject(element, val);
                            element.dispatchEvent(new Event('change'));
                            //console.log(element.value);
                        }
                        if (element.type == 'select-multiple') {
                            element.value = val;
                        }
                    }
                }
                //console.log( prop+":"+val );
                return true;
              }
        });

        this.events(params);
    }

    async isObject(element, val){
        if(val instanceof Object){
            let el = element.getAttribute('id')
            let path = el.replace(`${element.getAttribute('id').split('.')[0]}.`,'');
            element.value = JSONPath(path, val)[0]
        }else{
            element.value = val ? val : '';
        }
    }

    setModel(data, combo){
        Object.keys(data).forEach((key) => {
            this.model[key] = data[key];
        });
        if(combo) combo.comboSequencia();
    }

    scope(element){

        if (element.hasAttribute('id')) {
            if (['textarea', 
                'text', 
                'email', 
                'password', 
                'number', 
                'date', 
                'datetime-local'].includes(element.getAttribute('type'))
            ) {
                this.model[element.getAttribute('id')] = element.value;
            }
            if (['checkbox', 'radio'].includes(element.getAttribute('type'))) {
                this.model[element.getAttribute('id')]  = element.checked;
            }
            if (element.type == 'select-one') {
                //TODO: VALIDAR SINCRONIA DE CARREGAMENTO: PARENT -> CHILD
                this.model[element.getAttribute('id')] = element.options[element.selectedIndex].value;
            }
            if (element.type == 'select-multiple') {
                this.model[element.getAttribute('id')] = [...element.options].filter(option => option.selected).map(option => option.value);
            }
        }
    }

    events(params){
        //RESET FORM -> CLEAR VALUES INTO MODEL
        document.querySelector(params.form.id).addEventListener('reset', (event) => {  
            Object.keys(this.model).forEach((key) => {
                this.model[key] = '';
            });
        }, false);

        //CHANGE FORM VALUE -> SET VALUE INTO MODEL
        document.querySelector(params.form.id).addEventListener('change', (event) => {  
            this.scope(event.target);
        }, false);
    }
}