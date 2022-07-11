import { EsmFetch } from '/esm-core/EsmFetch.js';
import { EsmScope2 } from '/esm-core/EsmScope2.js';
import { EsmDataTable } from '/esm-core/EsmDataTable.js';

import { ListEndereco } from './ListEndereco.js';

export class Endereco {

    constructor(clss){

        this.esmScope = null;
        this.clss = clss;
        this.params = {
            form: {
                id: '#frmEndereco'
            },
            model: {
                id: null,
                uf: "",
                cidade: "",
                bairro: "",
                cep: "",
                complemento: "",
                logradouro: "",
                numero: "",
                principal: false,
                tipo: "",
                pessoa: {
                    id: clss.params.model.id
                }
            },
            url: '',
            id: '#tblEndereco', 
            hasPagination: true,
            hasSort: true,
            content: [],            
            totalElements: 0,
            size: 5,
            number: 0,        
            order: {
                field: 'id',
                direction: 'asc'
            },
            combo: [
                {
                    id: 'uf',
                    value: 'ufeSg',
                    text: 'ufeSg',
                    url: '/api/ceps/uf'
                },{
                    order: 0,
                    id: 'cidade',
                    parent: 'uf',
                    value: 'locNo',
                    text: 'locNo',
                    url: '/api/ceps/localidade'
                },{
                    order: 1,
                    id: 'bairro',
                    parent: 'cidade',
                    value: 'baiNo',
                    text: 'baiNo',
                    url: `/api/ceps/bairro`
                }
            ]
        };
        this.lstEndModal = null;        
    }

    template(){
        
        return {
            html: '/app/crm/endereco/endereco.html'
        }
    }

    async init() {
        
        this.esmFetch = new EsmFetch();
        this.esmScope = new EsmScope2(this.params);
        this.esmDataTable = new EsmDataTable(this);
        
        this.listEndereco = new ListEndereco(this);
        await this.esmFetch.loadModule(this.listEndereco, '#containerModal');

        this.events();
    }

    async search(id){

        if(!id){
            id = this.clss.params.model.id;
        }
        
        this.params.model.pessoa.id = id;
        let url = `/api/enderecos/paged`;
        let params = `idPessoa=${id}&size=${this.params.size}&page=${this.params.number}&sort=${this.params.order.field},${this.params.order.direction}`;
        let result = await this.esmFetch.getData(url, params); 
        this.params = {...this.params, ...result};
        await this.esmDataTable.table(result); 
        await this.esmDataTable.pagination();
        await this.esmDataTable.sort();
    }

    async edit(id){
        let endereco = this.params.content.find(item => item.id === id);
        this.esmScope.setModel(this.params, endereco);
    }

    async delete(id){
        await this.esmFetch.delete('/api/enderecos', id);
        await this.search();
    }

    async pesquisaCEP(cep) {
        let url = '/api/ceps/pesquisar/';
            url += cep;
        let result = await this.esmFetch.getData(url, '');
        this.esmScope.setModel(this.params, result);
    }

    async pesquisaLog(logradouro){

        //let url = '/api/ceps/pesquisarLog/';
        //    url += logradouro;
        //let result = await this.esmFetch.getData(url, '');
        this.lstEndModal = new bootstrap.Modal(document.querySelector('#listEnderecoModal'));
        this.lstEndModal.show();

        document.querySelector('#listEnderecoModal').addEventListener('shown.bs.modal', async (event) => {
            await this.listEndereco.search(logradouro);
        }, false);
    }

    events(){

        document.querySelector('#btnLimparEndereco').addEventListener('click', (event) => {
            document.querySelector(this.params.form.id).reset();
        }, false);

        document.querySelector('#btnPesquisaCEP').addEventListener('click', async (event) => {
            let cep = document.querySelector('#cep');
            let logradouro = document.querySelector('#logradouro');
            let url = '';
            
            if(cep.value){
                this.pesquisaCEP(cep.value);
            }else if(logradouro.value){
                this.pesquisaLog(logradouro.value)
            }
        }, false);

        document.querySelector('#btnSalvarEndereco').addEventListener('click', async (event) => {
            await this.esmFetch.setData('/api/enderecos', [this.params.model]);
            await this.search();
            document.querySelector(this.params.form.id).reset();
        }, false)
    }
}