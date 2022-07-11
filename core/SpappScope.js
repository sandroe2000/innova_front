import { SpappFetch } from "./SpappFetch.js";

export class SpappScope {

    constructor(params){
        this.spappFetch = new SpappFetch();
        this.init(params);
    }

    init(params){
        //CHANGE MODEL VALUE -> SET VALUE INTO FORM
        this.model = new Proxy(params.model, {
            set: async (target, prop, val) => {
                target[prop] = val;
                let elements = document.querySelector(params.form.id).elements;
                for (let element of elements) {
                    if (element.hasAttribute('spapp-bind') && element.getAttribute('spapp-bind')==prop) {
                        if (['textarea', 
                            'text', 
                            'email', 
                            'password', 
                            'number'].includes(element.getAttribute('type'))
                        ) {
                            element.value = val;
                        }
                       
                        if (['checkbox', 'radio'].includes(element.getAttribute('type'))) {
                            element.checked = val ? true : false;
                        }
  
                        if (element.getAttribute('type') == 'date') {
                            element.value = val.split('/').reverse().join('-');
                        } else if (element.getAttribute('type') == 'datetime-local') {
                            element.value = val.split('/').reverse().join('-') + ' 00:00';
                        }

                        if (element.type == 'select-one') {
                            element.value = val ? val : '';
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

    setModel(data){
        Object.keys(data).forEach((key) => {
            this.model[key] = data[key];
        });
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
            let elements = document.querySelector(params.form.id).elements;
            for (let element of elements) {
                if (event.target.hasAttribute('spapp-bind')) {
                    if (['textarea', 
                        'text', 
                        'email', 
                        'password', 
                        'number', 
                        'date', 
                        'datetime-local'].includes(element.getAttribute('type'))
                    ) {
                        this.model[element.getAttribute('spapp-bind')] = element.value;
                    }
                    if (['checkbox', 'radio'].includes(element.getAttribute('type'))) {
                        this.model[element.getAttribute('spapp-bind')]  = element.checked;
                    }
                    if (element.type == 'select-one') {
                        this.model[element.getAttribute('spapp-bind')] = element.options[element.selectedIndex].value;
                    }
                    if (element.type == 'select-multiple') {
                        this.model[element.getAttribute('spapp-bind')] = [...element.options].filter(option => option.selected).map(option => option.value);
                    }
                }
            }
        }, false);
    }
}