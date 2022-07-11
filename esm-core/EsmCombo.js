import { EsmFetch } from './EsmFetch.js';

export class EsmCombo {

    constructor(options){
        this.options = options;
        this.esmFetch = new EsmFetch();
        this.init();
    }

    init(){
        if(this.options.parent){
            document.querySelector(`#${this.options.parent}`).addEventListener('change', (event) => {
                this.carregarCombo(event.target.value);
            }, false);
        }else{
            this.carregarCombo();
        }
    }

    async carregarCombo(parentId){

        let url = this.options.url.concat( parentId ? parentId : '' );
        let data = await this.esmFetch.getData(encodeURI(url), '');
        let combo = document.querySelector(`#${this.options.id}`);
        
        document.querySelectorAll(`#${this.options.id} option`).forEach(option => option.remove());

        let opt = document.createElement("OPTION");
            opt.setAttribute('value', '');
            opt.textContent = 'Selecione';
            combo.appendChild(opt);

        if(data && data.content.length > 0){
            data.content.forEach(element => {
                let opt = document.createElement("OPTION");
                    opt.setAttribute('value', `${element[this.options.value]}`.toUpperCase());
                    opt.textContent = element[this.options.text].toUpperCase();
                    combo.appendChild(opt);
            });
            if(this.options.parent){
                let index = 0;
                for(let option of combo.options){
                    if(option.text == this.options.data[this.options.id]){
                        index = option.index;
                    }
                }
                combo.selectedIndex = index;
            }
        }
    }
}