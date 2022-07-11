export class Manifestacao {

    template(){
        
        return {
            html: '/app/crm/manifestacao/manifestacao.html'
        }
    }

    async domain(){
        return {
            id: 0,
            idChamado: 0,
            idLinha: 0,
            idManifescacao: 0,
            idGrupoManifestacao: 0,
            idProdutoAssunto: 0,
            idVariedade: 0,
            idTipoManifestacao: 0,
            descricaoManifestacao: '',
            idFuncionario: 0,
            dataPrevisao: '',
            dataAbertura: '',
            idestadoEmocional: 0,
            idStatusManifestacao: 0,
            idClassificacao: 0,
            followUps: [{
                id: 0,
                mensagem: '',
                resposta: '',
                idEvento: 0,
                idEquipe: 0,
                idFuncionario: 0,
                anexosFollowUps: [{
                    id: 0,
                    idFile: 0,
                    idFuncionario: 0
                }]
            }],
            descricaoConclusao: '',
            idGrauSatisfacao: 0,
            idResultadoManifestacao: 0,
            dataConclusao: ''
        };
    }

    async init() {
        this.layout();
    }

    layout(){
        
        document.querySelectorAll('.table-responsive').forEach(elm => {            
            const ps = new PerfectScrollbar(elm);
        });

        document.querySelectorAll('div.tab-content .tab-pane').forEach(elm => {            
            const ps = new PerfectScrollbar(elm, {suppressScrollX: true, minScrollbarLength: 80});
        });
    }
}