export class EsmFetch {

    constructor() {
        this.headers = {
            'Authorization': `Bearer ${this.getCookie('LOGIN_TOKEN')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }

    async loadModule(module, container){

        let template = module.template();
        await this.getTemplate(`${template.html}`)
            .then((html) => {
                document.querySelector(container).insertAdjacentHTML('afterbegin', html);
            });
        await module.init();
    }

    async getData(url, params) {

        let result = false;

        try {
            const response = await fetch(`${url}?${params}&uuidv4=${this.uuidv4()}`, {
                method: 'GET',
                headers: this.headers
            });
            if (response.ok) {
                result = response.json();
            }
        } catch (err) {
            console.log(err);
        }

        return result;
    }

    async getFromFormData(url, json) {

        let result = null;

        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getCookie('LOGIN_TOKEN')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(json)
            })
            .then(response => response.text())
            .then((resp) => {
                result = JSON.parse(resp);
            })
            .catch((error) => {
                console.log('Deu ruimmmmm...')
            });    
        } catch (err) {
            console.log(err);
        }

        return result;
    }

    async setData(url, json) {

        let result = false;
        let uri = `${url}/${json.id}?uuidv4=${this.uuidv4()}`
        let method = "PUT";

        if (!json.id) {
            delete json.id;
            uri = `${url}?uuidv4=${this.uuidv4()}`
            method = "POST"
        }

        Object.keys(json).forEach((item) => {

            if (json[item] === '') json[item] = null;
        });

        await fetch(uri, {

                method: method,
                headers: this.headers,
                body: JSON.stringify(json)
            })
            .then(response => response.text())
            .then((resp) => {

                let obj = JSON.parse(resp);

                if (obj.status > 200) {
                    let msg = obj.message || obj.errors[0].defaultMessage;
                    new AWN().warning(`As informações não foram gravadas.<br />${msg}`, { durations: { warning: 3000 } });
                } else {
                    result = true;
                    new AWN().success('As informações foram gravadas com sucesso!', { durations: { success: 1500 } });
                }
            })
            .catch((error) => {
                new AWN().alert(`As informações não foram gravadas.<br />${error}`, { durations: { warning: 3000 } });
            });
        return result;
    }

    async delete(url, codigo) {

        let result = false;

        try{
            if(window.confirm('Deseja realmente remover este item?')){
                let uri = `${url}/${codigo}?uuidv4=${this.uuidv4()}`;
                let method = "DELETE";
                const response = await fetch(uri, {
                    method: method,
                    headers: this.headers
                });
        
                if (response.ok) {
                    result = true;
                }
            };

        }catch(err){
            console.error(err);
        }

        return result;
    }

    async setLogin(url, json) {

        let result = false;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("username", json.username);
        urlencoded.append("password", json.password);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        await fetch(url, requestOptions)
            .then(response => response.text())
            .then((resp) => {
                if (resp.indexOf('access_token') == -1) return false;
                let obj = JSON.parse(resp);
                document.cookie = `LOGIN_TOKEN=${encodeURIComponent(obj.access_token)}`;
                result = true;
            })
            .catch(error => console.log('error', error));

        return result;
    }

    async getTemplate(url, params) {

        const response = await fetch(`${url}?uuidv4=${this.uuidv4()}${params}`, {
            method: 'GET',
            headers: this.headers
        });
        return response.text();
    }

    getCookie(name) {

        let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    uuidv4() {

        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    camelize(str) {
        let string = str.toLowerCase()
            .replace(/[^A-Za-z0-9]/g, ' ').split(' ')
            .reduce((result, word) => result + this.capitalize(word.toLowerCase()));
        return string.charAt(0).toLowerCase() + string.slice(1);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
    }
}