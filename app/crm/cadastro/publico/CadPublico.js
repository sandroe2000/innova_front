import { EsmScope } from '/esm-core/EsmScope.js';
import { EsmFetch } from '/esm-core/EsmFetch.js';
import { EsmDataTable } from '/esm-core/EsmDataTable.js';

export class CadPublico {

    constructor(clss){

        this.clss = clss;
        this.params = {
            form: {
                id: '#ifrmCadPublico'
            },
            model: {
                id: 0,
                corporativo: '',
                descricao: '',
                inativo: ''
            },
            url: '',
            id: '#tblCadPublico', 
            hasPagination: true,
            hasSort: true,
            content: [],            
            totalElements: 0,
            size: 5,
            number: 0,        
            order: {
                field: 'descricao',
                direction: 'asc'
            }
        };
        this.esmfetch = new EsmFetch();
    }

    template(){        
        return {
            html: '/app/crm/cadastro/publico/cadPublico.html'
        }
    }

    async init(){
        this.esmScope = new EsmScope(this.params);
        this.esmDataTable = new EsmDataTable(this);
        this.events();
    }

    async search(){
        //TODO: VALIDAR PARAMS
        let descricao = document.querySelector('#descricao').value;
        let url = `/api/publicos/search`;
        let params = `search=${descricao}&size=${this.params.size}&page=${this.params.number}&sort=${this.params.order.field},${this.params.order.direction}`;
        let result = await this.esmfetch.getData(url, params); 
        this.params = {...this.params, ...result};
        await this.esmDataTable.table(result); 
        await this.esmDataTable.pagination();
        await this.esmDataTable.sort();
    }

    events(){

        document.querySelector('#btnPesquisar').addEventListener('click', (event) => {
            this.search();
        }, false);

        document.querySelector('#btnLimpar').addEventListener('click', (event) => {
            document.querySelector(this.params.form.id).reset();
        }, false);

        document.querySelector('#btnGravar').addEventListener('click', (event) => {
            this.gravar();
        }, false);
    }

    async delete(id){
        await this.esmfetch.delete(`/api/publicos`, id);
        await this.search();
    }

    edit(id){
        let data = this.params.content.find(item => item.id == id);
        this.esmScope.setModel(data);
    }

    async gravar(){
        if(this.params.model.descricao=='') {
            new AWN().warning(`<strong>Descricão</strong> é um campo requerido!`, 
                { 
                    durations: { warning: 3000 },
                    labels : { warning: "ATENÇÃO" } 
                }
            );
        }else{
            await this.esmfetch.setData('/api/publicos', this.params.model);
            await this.search();
        }
    }
}