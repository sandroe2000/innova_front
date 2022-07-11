//import { SpappFetch } from '/core/SpappFetch.js';
import { JSONPath } from '/node_modules/jsonpath-plus/dist/index-browser-esm.js';

export class EsmDataTable { 

    constructor(options){

        this.options = options.params;
        this.clss = options;

        this.params = { 
            url: this.options ? this.options.url : '',
            id: this.options ? this.options.id : '', 
            hasPagination: this.options ? this.options.hasPagination : false,
            hasSort: this.options ? this.options.hasSort : false,
            content: [],
            pag: {
                totalElements: 0,
                size: 5,
                number: 0,         
            },
            sort: {
                field: '',
                direction: ''
            } 
        };
        //-> MERGE OBJECT: this.params = {...this.params, ...{XXX}} 

        this.trigger = [
            {func:'code', css:'fas fa-code'},
            {func:'config', css:'fa fa-cogs'},
            {func:'delete', css:'far fa-trash-alt'},
            {func:'edit', css:'far fa-edit'},
            {func:'aboutCar', css:'fas fa-car-crash'},
            {func:'talk', css:'fas fa-bullhorn'},
            {func:'view', css:'far fa-eye'}
        ];
        //-> Adicional nova "function" e "icon" ao evento click
        //this.trigger.push({func:'XXX', css:'XXXXXXXXXX'}
        
        //this.init();
    }

    async init(){

        if(!this.params.url) return false;

        let content = await this.search(this.params.url);        
        let params = {
            url: this.params.url,
            id: this.params.id,
            content: content,
            pag: {
                totalElements: content.totalElements,
                size: content.size,
                number: content.number
            }
        };
        //-> MERGE OBJECT: {...this.params, ...XXX}
        this.params = {...this.params, ...params};

        await this.table();
        if(this.params.hasPagination) await this.pagination();
        if(this.params.hasSort) await this.sort();
    }

    async search(url){

        let size = document.querySelector(`${this.params.id}Size`) ? document.querySelector(`${this.params.id}Size`).value : this.params.pag.size;
        let sort = `${this.params.order.field || 'codigo'},${this.params.order.direction || 'asc'}`;
        let descricao = this.params.model ? this.params.model.descricao : '';

        if(!this.params.hasPagination) size = 100;

        //TODO: carregar parametros de pesquisa para query[campo=valor] de forma dinamica

        // EXEMPLO PARA URL SPRINGBOOT REST PAGINATION:
        // 1 - Parametros de pesquisa para query[campo=valor];
        // 2 - Número da página atual
        // 3 - Quantidade de registros por página
        // 4 - Ordenação, campo e direção
        //
        //     _1____________   _2__   _3___   _4_____________
        //    /              \ /    \ /     \ /               \
        //-> ?descricao=&nome=&page=0&size=10&sort=descricao,asc
        let urlParams = `descricao=${descricao}&page=${this.params.pag.number}&size=${size}&sort=${sort}`;
        return await new EsmFetch().getData((url), urlParams);
    }

    async table(content){

        if(content) this.params = {...this.params, ...content};
        if(!this.params.id) return false;
        if(!this.params.content) return false;

        //this.params.totalPages; = Math.ceil(this.params.pag.totalElements/this.params.pag.size);

        let thead = document.querySelectorAll(`${this.params.id} thead tr th`);
        let tbody = document.querySelector(`${this.params.id} tbody`);
        let tabTr = this.getTabTr(`${this.params.id}`);
        let tabTrNr = this.getTabTrNr(`${this.params.id}`);

        this.clearTable(tbody);

        if (!this.params.content || this.params.content.length === 0) {
            tbody.insertAdjacentHTML('beforeend', tabTrNr.outerHTML);
        } else {            
            this.params.content.forEach(element => {
                let tabTR = document.createElement('tr');
                for (let th of thead) {
                    tabTR.appendChild(this.setTh(th, tabTR, element));
                }
                tbody.appendChild(tabTR);
            });
        }

        this.tableEvents();
        this.layout();
    }

    tableEvents(){

        if(!document.querySelectorAll(`${this.params.id} tbody em`)) return false;

        document.querySelectorAll(`${this.params.id} tbody em`).forEach(element => {
            element.addEventListener('click', (event) => {
                this.functionFactory(event);
            }, false);
        });
    }

    functionFactory(event){

        let css = event.target.getAttribute('class');
        let id = event.target.closest('tr').getAttribute('id');
        let func = this.getFuncByCss(css);
        eval(`this.clss.${func}(${id})`);
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
                        tabEM.setAttribute('class', this.getCssByFunc(item));
                        tabEM.setAttribute('style', 'font-size:18px; margin-left:20px; cursor:pointer;');
                        tabTD.appendChild(tabEM);
                });

            }
            tabTR.appendChild(tabTD);
        });

        return tabTR;
    }

    getFuncByCss(css){

        let result = 'none';

        try{
            let obj = this.trigger.filter(content => content.css == css);
            result = obj[0].func;
        } catch(err) {
            console.log(err);
        }

        return result; 
    }

    getCssByFunc(func){

        let result = 'fas fa-bug';

        try{
            let obj = this.trigger.filter(content => content.func == func);
            result = obj[0].css;
        } catch(err) {
            console.log(`Função não inexiste atribuida à propriedade spapp-trigger="${func}" !`);
        }

        return result; 
    }

    none(){
        console.log('Função não inexiste atribuida à propriedade "spapp-trigger" da tabela!');
    }

    setTh(th, tabTR, content) {

        let key = th.getAttribute('spapp-data') || th.getAttribute('spapp-id');
        let result = JSONPath(`$.${key}`, content).toString();

        if (result === 'false') {
            result = '';
        }

        let tabTDContent = null;
        let tabTD = document.createElement('td');
        if (th.getAttribute('class').indexOf('text-right') > -1) {
            tabTD.setAttribute('class', 'px-2 text-right nobr');
        } else {
            tabTD.setAttribute('class', 'px-2 text-left nobr');
        }

        tabTDContent = document.createTextNode(result);
        
        if (th.hasAttribute('spapp-id')) {
            tabTR.setAttribute('id', result);
            tabTD.appendChild(tabTDContent);
        }

        if (th.hasAttribute('spapp-data')) {
            if (result === 'true') {
                let tabEM = document.createElement('em');
                tabEM.setAttribute('class', 'fas fa-check');
                tabEM.setAttribute('style', 'color: var(--success); font-size:18px; margin-left:15px;');
                tabTD.appendChild(tabEM);
            } else {
                tabTD.appendChild(tabTDContent);
            }
        }

        if (th.hasAttribute('spapp-trigger')) {
            th.getAttribute('spapp-trigger').split(',').forEach(item => {
                let tabEM = document.createElement('em');
                    tabEM.setAttribute('class', this.getCssByFunc(item));
                    tabEM.setAttribute('style', 'color: var(--primary); font-size:18px; margin-left:15px;');
                tabTD.appendChild(tabEM);
            });
        }

        return tabTD;
    }

    async pagination(){
        
        if(document.querySelector(`${this.params.id}Pagination`)){
            document.querySelector(`${this.params.id}Pagination`).remove() ;
        }

        let table = document.querySelector(`${this.params.id}`);
        let div = document.createElement('div');
            div.setAttribute('id', `${this.params.id}Pagination`.replace('#',''));
            div.setAttribute('class', 'd-flex justify-content-between');
        let divSize = document.createElement('div');
        let selSize = document.createElement('select');
            selSize.setAttribute('id', `${this.params.id}Size`.replace('#',''));
            selSize.setAttribute('class', 'form-control form-select');
            selSize.setAttribute('title', 'Size Pagination');
        
        let arr = [5, 10, 20, 50];
        for(let i in arr){
            let optSize = document.createElement("option");
                optSize.setAttribute("value", arr[i]); 
                if(arr[i] == this.params.size){    
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
            ulPag.setAttribute('id', `${this.params.id}PagnUl`.replace('#',''));
            ulPag.setAttribute('class', 'pagination');

        divSize.appendChild(selSize);
        
        //-> LOGICA PARA OS BOTÕES NA TELA
        let maxLen = this.params.totalPages;
        let number = this.params.number;

        ulPag.appendChild(this.newPageItem(this.params, 'Anterior'));

       if((number) < 5){
            if(number <= 2){
                for(let i=0; i<(maxLen < 5 ? maxLen : 5); i++) {
                    ulPag.appendChild(this.newPageItem(this.params, i));
                }
            }else{
                for(let i=0; i<(number+2 > maxLen ? maxLen : number+2); i++) {
                    ulPag.appendChild(this.newPageItem(this.params, i));
                }
            }            
        }

        if((number) >= 5){

            ulPag.appendChild(this.newPageItem(this.params, 0));
            ulPag.appendChild(this.newPageItem(this.params, '...'));

            for(let i=(number-2); i<=(number+2 > maxLen-1 ? maxLen-1 : number+2); i++) {
                ulPag.appendChild(this.newPageItem(this.params, i));
            }
        }
        
        ulPag.appendChild(this.newPageItem(this.params, 'Próximo'));

        divNav.appendChild(ulPag);
        divPag.appendChild(divNav);
        div.appendChild(divSize);
        div.appendChild(divPag);

        table.parentElement.parentElement.insertAdjacentHTML('beforeend', div.outerHTML);

        await this.paginationEvents();
    }

    async paginationEvents(){

        document.querySelectorAll(`${this.params.id}PagnUl li`).forEach(element => {

            element.querySelector('a').addEventListener('click', (event) => {
                
                if(event.target.parentElement.classList.contains('active') || event.target.parentElement.classList.contains('disabled')){
                    return false;
                }
        
                if(event.target.textContent=='Anterior'){
                    this.clss.params.number = (this.clss.params.number -1);
                }
        
                if(!isNaN(event.target.textContent)){
                    this.clss.params.number = (event.target.textContent - 1);
                }
        
                if(event.target.textContent=='Próximo'){
                    this.clss.params.number = (this.clss.params.number+1);
                }
                
                event.preventDefault();
                event.stopPropagation();        
                this.clss.search();
                
            }, false);
        });

        document.querySelector(`${this.params.id}Size`).addEventListener('change', (event) => {

            this.clss.params.number = 0;
            this.clss.params.size = document.querySelector(`${this.params.id}Size`).value;

            event.preventDefault();
            event.stopPropagation();        
            this.clss.search();

        },false);

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
       
        document.querySelectorAll(`${this.clss.params.id} thead tr th`).forEach(element => {

            if(element.querySelector('em')){
                this.clearSort();
            }

            if (element.hasAttribute('spapp-id') || element.hasAttribute('spapp-data')) {

                let ico = ' fa-sort';
                let field = element.getAttribute('spapp-id') ? element.getAttribute('spapp-id') : element.getAttribute('spapp-data');

                if(field == this.clss.params.order.field){   
                    if(this.clss.params.order.direction=='asc') ico = ` fa-sort-down`;
                    if(this.clss.params.order.direction=='desc') ico = ` fa-sort-up`;
                }
                
                let em = document.createElement('em');
                    em.setAttribute('class', `fas${ico} ml-2 mr-4`);

                element.appendChild(em);

                element.querySelector('em').addEventListener('click', (event) => {

                    let el = event.target.parentElement;
                    this.clss.params.order.field = el.getAttribute('spapp-id') || el.getAttribute('spapp-data');
                    this.clss.params.order.direction = this.clss.params.order.direction=='asc' ? 'desc' : 'asc';
                    //this.clearSort();
                    //this.sort();
                    event.preventDefault();
                    event.stopPropagation();        
                    this.clss.search();

                }, false);
            }
        });
    }

    clearSort(){
        document.querySelectorAll(`${this.clss.params.id} thead tr th`).forEach(element => {
            if(element.querySelector('em')) element.querySelector('em').remove();
        });
    }

    layout(){
        if(!document.querySelectorAll('.table-responsive')) return false;
        document.querySelectorAll('.table-responsive').forEach(element => {
            const ps = new PerfectScrollbar(element);
        });
    }
}
