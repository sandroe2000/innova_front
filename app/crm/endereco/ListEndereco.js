import { EsmFetch } from '/esm-core/EsmFetch.js';
import { EsmDataTable } from '/esm-core/EsmDataTable.js';

export class ListEndereco {

    constructor(clss){
        this.clss = clss;
        this.params = {
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
            id: '#tblListEndereco', 
            hasPagination: true,
            hasSort: true,
            content: [],
            totalElements: 0,
            size: 5,
            number: 0,        
            order: {
                field: 'cep',
                direction: 'asc'
            }
        };

    }

    template(){        
        return {
            html: '/app/crm/endereco/listEndereco.html'
        }
    }

    async init(){
        this.esmFetch = new EsmFetch();
        this.esmDataTable = new EsmDataTable(this);
    }

    async search(logradouro){

        if(!logradouro){
            logradouro = document.querySelector('#frmEndereco #logradouro').value;
        }

        let url = `/api/ceps/pesquisarLog/${logradouro}`;
        let params = `size=${this.params.size}&page=${this.params.number}&sort=${this.params.order.field},${this.params.order.direction}`;
        let result = await this.esmFetch.getData(url, params);
        this.params = {...this.params, ...result};
        for(let end of result.content){
            end.uf = end.bairro.uf.ufeSg;
            end.cidade = end.bairro.localidade.locNo;
            end.bairro = end.bairro.baiNo;
            end.logradouro = end.logNo;
        }
        await this.esmDataTable.table(result); 
        await this.esmDataTable.pagination();
        await this.esmDataTable.sort();
    }

    async edit(cep){
        await this.clss.pesquisaCEP(cep);
        this.clss.lstEndModal.hide();
    }
}