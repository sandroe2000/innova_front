export class SpappFetch {

    constructor() {
        this.token = this.getCookie('LOGIN_TOKEN');
        this.headers = {
            'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJNQVJJQU5FIiwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfTUFOQUdFUiIsIlJPTEVfU1VQRVJfQURNSU4iXSwiaXNzIjoiL2FwaS9sb2dpbiIsImV4cCI6MTY0NDQ1MzQ2NH0.DGFTiBnVr9iQxGmcUWnM4afyKUFK-lwbXWJ7uaMD3J0`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
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

    async setData(url, json) {

        let result = false;
        let uri = `${url}/${json.codigo}?uuidv4=${this.uuidv4()}`
        let method = "PUT";

        if (!json.codigo) {
            delete json.codigo;
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
        let uri = `${url}/${codigo}?uuidv4=${this.uuidv4()}`;
        let method = "DELETE";
        const response = await fetch(uri, {
            method: method,
            headers: this.headers
        });

        if (response.ok) {
            result = true;
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

    async comboEstatico(params) {

        let sel = document.querySelector(params.id);
        let arr = params.valText.split(',');

        if (params.parentId) {
            parent = `/${document.querySelector(params.parentId).value}`;
        }

        await fetch(`${params.url}?uuidv4=${this.uuidv4()}`, {
            method: 'GET',
            headers: this.headers
        }).then(response => {
            return response.json();
        }).then((data) => {

            $(params.id).find('option:not(:first)').remove();

            obj.add( this.setOption('', 'Selecione'));

            if (data.content) {
                data = data.content;
            }

            data.forEach(element => {
                obj.add( this.setOption(element[arr[0]], element[arr[1]]) );
            });
        });
    }

    async comboDinamico(obj) {

        if (!obj.getAttribute('spapp-url')) return false;
        if (!obj.getAttribute('spapp-val-text')) return false;

        let arr = obj.getAttribute('spapp-val-text').split(',');
        let parentId = obj.getAttribute('spapp-parent-id');
        let parent = '';

        if (parentId) {
            parent = `/${document.querySelector(parentId).value}`;
        }

        if (parent == '/') parent = '/0';

        $(obj).find('option:not(:first)').remove();
        obj.add( this.setOption('', 'Selecione'));

        await fetch(`${obj.getAttribute('spapp-url')}${parent}?uuidv4=${this.uuidv4()}`, {
            method: 'GET',
            headers: this.headers
        }).then(response => {
            return response.json();
        }).then((data) => {
            if (data.content) data = data.content;
            data.forEach(element => {
                obj.add( this.setOption(element[arr[0]], element[arr[1]]) );
            });
        });
    }

    setOption(val, text){
        let opt = document.createElement("option");
        opt.value = val;//element[arr[0]];
        opt.text = text;//element[arr[1]];
        return opt;
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