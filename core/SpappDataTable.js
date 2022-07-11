import { SpappFetch } from '../../core/SpappFetch.js';
import { JSONPath } from '/node_modules/jsonpath-plus/dist/index-browser-esm.js';

export class SpappDataTable {

    constructor(){
        this.params = {
            url: '',
            id: '',
            data: [],
            pag: {
                totalElements: 0,
                size: 0,
                number: 0,
            }
        }
    }

    async init(){
        //-> SOBRESCREVER "this.params"
        await this.table();
        await this.pagination();
        await this.sort();
    }

    async search(url){

        //TODO: BUSCAR de "tbl{NOME_DA_TABELA}Size"
        let size = document.querySelector(`#${this.params.id}Size`) ? document.querySelector(`#${this.params.id}Size`).value : 5;

        //TODO: BUSCAR DE {this.params.sort}
        let sort = 'codigo,asc';

        // EXEMPLO PARA URL SPRINGBOOT REST PAGINATION:
        // 1 - Parametros de pesquisa para query;
        // 2 - Recuperar da paginação
        // 3 - Linhas por página
        // 4 - Ordenação, campo e direção
        //
        //     ______1_______   __2_   __3_   ____4____
        //    /              \ /    \ /    \ /         \
        //-> ?descricao=&nome=&page=0&size=5&sort=id,asc
        let urlParams = `descricao=&page=${this.params.pag.number}&size=${size}&sort=${sort}`;
        return await new SpappFetch().getData((url), urlParams);
    }

    async table(){

        if(!this.params.id) return false;
        if(!this.params.data) return false;

        this.params.pag.totalPages = Math.ceil(this.params.pag.totalElements/this.params.pag.size);

        let thead = document.querySelectorAll(`#${this.params.id} thead tr th`);
        let tbody = document.querySelector(`#${this.params.id} tbody`);
        let tabTr = this.getTabTr(`#${this.params.id}`);
        let tabTrNr = this.getTabTrNr(`#${this.params.id}`);

        this.clearTable(tbody);

        if (!this.params.data || this.params.data.length === 0) {
            tbody.insertAdjacentHTML('beforeend', tabTrNr.outerHTML);
        } else {            
            this.params.data.forEach(element => {
                let tabTR = document.createElement('tr');
                for (let th of thead) {
                    tabTR.appendChild(this.setTh(th, tabTR, element));
                }
                tbody.appendChild(tabTR);
            });
        }
    }

    clearTable(tbody){

        if(!tbody.querySelectorAll('tr')) return false;

        tbody.querySelectorAll('tr').forEach(element => {
            tbody.removeChild(element);
        });
    }

    getTabTrNr(idTable) {

        let tabTrNr = document.createElement('tr');
        let tabTrNrTd = document.createElement('td');
            tabTrNrTd.setAttribute('colspan', document.querySelectorAll(`${idTable} th`).length);
            tabTrNrTd.setAttribute('class', 'text-center p-5 nobr');
        let tabTrNrContent = document.createTextNode('Nenhum registro encontrado!');
            
        tabTrNrTd.appendChild(tabTrNrContent);
        tabTrNr.appendChild(tabTrNrTd);

        return tabTrNr;
    }

    getTabTr(idTable) {

        let tabTR = document.createElement('tr');

        document.querySelectorAll(`${idTable} th`).forEach(element => {

            let tabTDContent = null;
            let spappId = element.getAttribute('spapp-id');
            let spappData = element.getAttribute('spapp-data');
            let tabTD = document.createElement('td');

            if (element.getAttribute('class').indexOf('text-left') > -1) {
                tabTD.setAttribute('class', 'text-left nobr');
            } else {
                tabTD.setAttribute('class', 'text-right nobr');
            }

            if (element.hasAttribute('spapp-id')) {
                tabTR.setAttribute('id', `#${spappId}#`);
                tabTDContent = document.createTextNode(`#${spappId}#`);
                tabTD.appendChild(tabTDContent);
            }

            if (element.hasAttribute('spapp-data')) {
                tabTDContent = document.createTextNode(`#${spappData}#`);
                tabTD.appendChild(tabTDContent);
            }

            if (element.hasAttribute('spapp-trigger')) {
                element.getAttribute('spapp-trigger').split(',').forEach(item => {
                    let tabEM = document.createElement('em');
                        tabEM.setAttribute('class', this.getIconClass(item));
                        tabEM.setAttribute('style', 'font-size:18px; margin-left:20px; cursor:pointer;');
                        tabTD.appendChild(tabEM);
                });

            }
            tabTR.appendChild(tabTD);
        });

        return tabTR;
    }

    getIconClass(trigger) {

        if (trigger == 'code') return 'fas fa-code';
        if (trigger == 'config') return 'fa fa-cogs';
        if (trigger == 'delete') return 'far fa-trash-alt';
        if (trigger == 'edit') return 'far fa-edit';
        if (trigger == 'aboutCar') return 'fas fa-car-crash';
        if (trigger == 'talk') return 'fas fa-bullhorn';
        if (trigger == 'view') return 'far fa-eye';
        if (trigger == 'house') return 'fas fa-house-chimney-crack';
    }

    replaceHtml(str, data) {

        Object.keys(data).forEach((item) => {

            if (data[item] === false) {
                data[item] = '';
            }

            if (data[item] === true) {
                data[item] = `<em class="fas fa-ban" style="font-size:18px; margin-left:20px; color:red"></em>`;
            }
            str = str.replaceAll(`#${item}#`, data[item] == '' ? '' : data[item])
        });

        return str;
    }

    setTh(th, tabTR, data) {

        let key = th.getAttribute('spapp-data') || th.getAttribute('spapp-id');
        let result = JSONPath(`$.${key}`, data).toString();

        if (result === 'false') {
            result = '';
        }

        let tabTDContent = null;
        let tabTD = document.createElement('td');
        if (th.getAttribute('class').indexOf('text-left') > -1) {
            tabTD.setAttribute('class', 'text-left nobr');
        } else {
            tabTD.setAttribute('class', 'text-right nobr');
        }

        tabTDContent = document.createTextNode(result);
        
        if (th.hasAttribute('spapp-id')) {
            tabTR.setAttribute('id', result);
            tabTD.appendChild(tabTDContent);
        }

        if (th.hasAttribute('spapp-data')) {
            if (result === 'true') {
                let tabEM = document.createElement('em');
                tabEM.setAttribute('class', 'fas fa-ban');
                tabEM.setAttribute('style', 'color: var(--gray-light); font-size:18px; margin-left:20px;');
                tabTD.appendChild(tabEM);
            } else {
                tabTD.appendChild(tabTDContent);
            }
        }

        if (th.hasAttribute('spapp-trigger')) {
            th.getAttribute('spapp-trigger').split(',').forEach(item => {
                let tabEM = document.createElement('em');
                    tabEM.setAttribute('class', this.getIconClass(item));
                    tabEM.setAttribute('style', 'color: var(--primary); font-size:18px; margin-left:20px; cursor:pointer;');
                tabTD.appendChild(tabEM);
            });
        }

        return tabTD;
    }

    async pagination(){
        
        if(document.querySelector(`#${this.params.id}Pagination`)){
            document.querySelector(`#${this.params.id}Pagination`).remove() ;
        }

        let table = document.querySelector(`#${this.params.id}`);
        let div = document.createElement('div');
            div.setAttribute('id', `${this.params.id}Pagination`);
            div.setAttribute('class', 'd-flex justify-content-between');
        let divSize = document.createElement('div');
        let selSize = document.createElement('select');
            selSize.setAttribute('id', `${this.params.id}Size`);
            selSize.setAttribute('class', 'form-control');
        
        let arr = [5, 10, 20, 50];
        for(let i in arr){
            let optSize = document.createElement("option");
                optSize.setAttribute("value", arr[i]); 
                if(arr[i] == this.params.pag.size){    
                    optSize.setAttribute("selected", "selected");           
                }
            let optTxtSize = document.createTextNode(arr[i]);        
            optSize.appendChild(optTxtSize);            
            selSize.appendChild(optSize);
        }

        let divPag = document.createElement('div');        
        let divNav = document.createElement('div');
            divNav.setAttribute('aria-label', 'Navegação da paginação');
        let ulPag = document.createElement('ul');
            ulPag.setAttribute('id', `${this.params.id}PagnUl`);
            ulPag.setAttribute('class', 'pagination');

        divSize.appendChild(selSize);
        
        //-> LOGICA PARA OS BOTÕES NA TELA
        let maxLen = this.params.pag.totalPages;
        let number = this.params.pag.number;

        ulPag.appendChild(this.newPageItem(this.params.pag, 'Anterior'));

       if((number) < 5){
            if(number <= 2){
                for(let i=0; i<(maxLen < 5 ? maxLen : 5); i++) {
                    ulPag.appendChild(this.newPageItem(this.params.pag, i));
                }
            }else{
                for(let i=0; i<(number+2 > maxLen ? maxLen : number+2); i++) {
                    ulPag.appendChild(this.newPageItem(this.params.pag, i));
                }
            }            
        }

        if((number) >= 5){

            ulPag.appendChild(this.newPageItem(this.params.pag, 0));
            ulPag.appendChild(this.newPageItem(this.params.pag, '...'));

            for(let i=(number-2); i<=(number+2 > maxLen-1 ? maxLen-1 : number+2); i++) {
                ulPag.appendChild(this.newPageItem(this.params.pag, i));
            }
        }
        
        ulPag.appendChild(this.newPageItem(this.params.pag, 'Próximo'));

        divNav.appendChild(ulPag);
        divPag.appendChild(divNav);
        div.appendChild(divSize);
        div.appendChild(divPag);

        table.parentElement.insertAdjacentHTML('beforeend', div.outerHTML);

        await this.paginationEvents();
    }

    async paginationEvents(){

        document.querySelectorAll(`#${this.params.id}PagnUl li`).forEach(element => {

            element.querySelector('a').addEventListener('click', (event) => {
                
                if(event.target.parentElement.classList.contains('active') || event.target.parentElement.classList.contains('disabled')){
                    return false;
                }
        
                if(event.target.textContent=='Anterior'){
                    this.params.pag.number = (this.params.pag.number -1);
                }
        
                if(!isNaN(event.target.textContent)){
                    this.params.pag.number = (event.target.textContent - 1);
                }
        
                if(event.target.textContent=='Próximo'){
                    this.params.pag.number = (this.params.pag.number+1);
                }
                
                event.preventDefault();
                event.stopPropagation();
        
                this.init();
                
            }, false);
        });
    }

    newPageItem(pag, label){

        let status = '';
        if(pag.number == 0 && label == 'Anterior'){
            status = ' disabled';
        }
        if(pag.number == pag.totalPages-1 && label == 'Próximo'){
            status = ' disabled';
        }
        if(label == '...'){
            status = ' disabled';
        }
        if(pag.number == label){
            status = ' active';
        }
        if(!isNaN(label)){
            label = label+1;
        }

        let li = document.createElement('li');
            li.setAttribute('class', `page-item${status}`);

        let a = document.createElement('a');
            a.setAttribute('class', 'page-link');
        let aTxt = document.createTextNode(label);
        
        a.appendChild(aTxt);
        li.appendChild(a);

        return li;
    }

    async sort(){
        console.log('calling sort...');
    }
}