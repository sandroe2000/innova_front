import { EsmScope2 } from '/esm-core/EsmScope2.js';
import { EsmFetch } from '/esm-core/EsmFetch.js';
import { EsmDataTable } from '/esm-core/EsmDataTable.js';

export class Identificacao{

    constructor(clss){

        this.esmScope = null;
        this.clss = clss;
        this.params = {
            form: { 
                id: '#frmIdentificacao'
            },
            model: {
                id: 0,
                corporativo: '',
                reie: '',
                cpf: '',
                nascimento: '',
                nome: '',
                email: '',
                buscaCorporativa: false
            },
            url: '',
            id: '#tblIdentificacao', 
            hasPagination: true,
            hasSort: true,
            content: [],            
            totalElements: 0,
            size: 5,
            number: 0,        
            order: {
                field: 'nome',
                direction: 'asc'
            }
        };
        this.esmfetch = new EsmFetch();
    }

    template(){        
        return {
            html: '/app/crm/identificacao/identificacao.html'
        }
    }

    async init() {
        this.esmScope = new EsmScope2(this.params);
        this.esmDataTable = new EsmDataTable(this);
        this.events();   
    }
    
    async search(){

        let url = `/api/pessoas/identificacao?size=${this.params.size}&page=${this.params.number}&sort=${this.params.order.field},${this.params.order.direction}`;
        let result = await this.esmfetch.getFromFormData(url, this.params.model);
        this.params = {...this.params, ...result};
        await this.esmDataTable.table(result);
        await this.esmDataTable.pagination();
        await this.esmDataTable.sort();
    }

    limpar(){
        document.querySelector(this.params.form.id).reset();
        console.log('Identificacao().limpar() ...');
    }

    cancelar(){
        this.limpar();
        console.log('Identificacao().cancelar() ...');
    }
    
    events(){
        
        document.querySelector('#frmIdentificacao #btnPesquisar').addEventListener('click', (event) => {
            this.search();
        }, false);

        document.querySelector('#frmIdentificacao #btnLimpar').addEventListener('click', (event) => {
            this.limpar();
        }, false);

        document.querySelector('#frmIdentificacao #btnCancelar').addEventListener('click', (event) => {
            this.cancelar();
        }, false);

        document.querySelectorAll('#tblIdentificacao tbody em').forEach(element => {
            element.addEventListener('click', (event) => {
                let id = event.target.closest('tr').getAttribute('id');
                if(event.target.classList.contains('fa-house-chimney-crack')){
                    this.residencial(id);
                }else if(event.target.classList.contains('fa-car-crash')){
                    this.veicular(id);
                }else if(event.target.classList.contains('fa-bullhorn')){
                    this.padrao(id);
                }
            }, false);
        });
    }

    async talk (id){
        let pessoa = this.params.content.find(item => item.id === id);
        //this.clss.params.model = {...this.clss.params.model, ...pessoa};
        this.clss.esmScope.setModel(this.clss.params, pessoa);
        await this.clss.endereco.search(id);
        $('#identidicacaoModal').modal('hide')
    }
}