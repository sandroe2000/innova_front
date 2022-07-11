import { EsmFetch } from '/esm-core/EsmFetch.js';
import { EsmScope2 } from '/esm-core/EsmScope2.js';
import { EsmDataTable } from '/esm-core/EsmDataTable.js';
import { Identificacao } from '/app/crm/identificacao/Identificacao.js';
import { Endereco } from '/app/crm/endereco/Endereco.js';

export class Pessoa {

    constructor(){

        this.esmScope = null;
        this.params = {
            form: {
                id: '#frmPessoa'
            },
            model: {
                id: 0,
                corporativo: '',
                celular: null,
                cnh: null,
                cpf: '',
                email: null,
                enderecos: [],
                naocontactar: [],
                nascimento: '',
                nome: '',
                passaporte: null,
                pfj: null,
                publico: null,
                rgie: null,
                sexo: null,
                status: null,
                telefone: null,
                tratamento: null,
                whatsApp: false,
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
            }
        };
        
        
    }

    template(){
        
        return {
            html: '/app/crm/pessoa/pessoa.html'
        }
    }

    async init() {
        
        this.esmFetch = new EsmFetch();
        this.esmScope = new EsmScope2(this.params);
        this.esmDataTable = new EsmDataTable(this);

        this.endereco = new Endereco(this);
        await this.esmFetch.loadModule(this.endereco, '#containerEndereco');

        this.identificacao = new Identificacao(this);
        await this.esmFetch.loadModule(this.identificacao, '#containerModal');

        this.events();
    }

    events(){

        document.querySelector('#btnGerarProtocolo').addEventListener('click', (event) => {
            console.log( this.params.model );
        },false);
    }
}