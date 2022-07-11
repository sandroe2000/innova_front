import { SpappFetch } from "./SpappFetch.js";

export class SpappBind {

    constructor() {
        this.spappFetch = new SpappFetch();
    }

    async init(data, form, io) {

        if (!data) return false;
        if (!form || !document.querySelector(form)) return false;

        let elements = document.querySelector(form).elements;

        for (let element of elements) {
            if (element.hasAttribute('spapp-bind')) {
                this.setInputTextOrEmailOrPassword(element, data, io);
                this.setInputNumberOrDateTimeLocal(element, data, io);
                this.setInputTextarea(element, data, io);
                await this.setSelectOne(element, data, io);
                this.setSelectMultiple(element, data, io);
                this.setInputCheckBox(element, data, io);
                this.setInputRadio(element, data, io);
            }
        }
    }

    setInputTextOrEmailOrPassword(element, data, io) {
        if (['text', 'email', 'password'].includes(element.getAttribute('type'))) {
            if (io == 'GET') {
                ['change', 'keyup'].forEach(evt => {
                    element.addEventListener(evt, function inputTextOrEmailOrPassword(event) {
                        data[element.getAttribute('spapp-bind')] = element.value;
                    }, false)
                });
            }
            if (io == 'SET' && data[element.getAttribute('spapp-bind')]) {
                element.value = data[element.getAttribute('spapp-bind')];
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    setInputNumberOrDateTimeLocal(element, data, io) {
        if (['number', 'date', 'datetime-local'].includes(element.getAttribute('type'))) {
            if (io == 'GET') {
                element.addEventListener('change', function inputNumberOrDateTimeLocal(event) {
                    data[element.getAttribute('spapp-bind')] = element.value;
                }, false);
            }
            if (io == 'SET' && data[element.getAttribute('spapp-bind')]) {
                if (element.getAttribute('type') == 'date') {
                    element.value = data[element.getAttribute('spapp-bind')].split('/').reverse().join('-');
                } else if (element.getAttribute('type') == 'datetime-local') {
                    element.value = data[element.getAttribute('spapp-bind')].split('/').reverse().join('-') + ' 00:00';
                } else {
                    element.value = data[element.getAttribute('spapp-bind')];
                }
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    setInputTextarea(element, data, io) {
        if (element.type == 'textarea') {
            if (io == 'GET') {
                ['change', 'keyup'].forEach(evt => {
                    element.addEventListener(evt, function inputTextarea(event) {
                        data[element.getAttribute('spapp-bind')] = element.value;
                    }, false);
                });
            }
            if (io == 'SET' && data[element.getAttribute('spapp-bind')]) {
                element.value = data[element.getAttribute('spapp-bind')];
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    async setSelectOne(element, data, io) {
        if (element.type == 'select-one') {
            if (io == 'GET') {
                element.addEventListener('change', function selectOne(event) {
                    if (element.options[element.selectedIndex]) {
                        data[element.getAttribute('spapp-bind')] = element.options[element.selectedIndex].value;
                    }
                }, false);
            }
            if (io == 'SET' && element.getAttribute('spapp-bind')   ) {
                await this.bindSelectOne(element, data);
                //element.value = data[element.getAttribute('spapp-bind')];
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    setSelectMultiple(element, data, io) {
        if (element.type == 'select-multiple') {
            if (io == 'GET') {
                element.addEventListener('change', function selectMultiple(event) {
                    data[element.getAttribute('spapp-bind')] = [...element.options].filter(option => option.selected).map(option => option.value);
                }, false);
            }
            if (io == 'SET' && data[element.getAttribute('spapp-bind')]) {
                element.value = data[element.getAttribute('spapp-bind')];
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    setInputCheckBox(element, data, io) {
        if (element.getAttribute('type') == 'checkbox') {
            if (io == 'GET') {
                element.addEventListener('change', function inputCheckBox(event) {
                    data[element.getAttribute('spapp-bind')] = element.checked;
                }, false);
            }
            if (io == 'SET' && data[element.getAttribute('spapp-bind')]) {
                element.checked = data[element.getAttribute('spapp-bind')] ? true : false;
            } else {
                element.checked = false;
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    setInputRadio(element, data, io) {
        if (element.getAttribute('type') == 'radio') {
            if (io == 'GET') {
                element.addEventListener('change', function inputRadio(event) {
                    if (element.checked) {
                        data[element.getAttribute('spapp-bind')] = element.value;
                    }
                }, false);
            }
            if (io == 'SET' && data[element.getAttribute('spapp-bind')]) {
                if (element.value == data[element.getAttribute('spapp-bind')]) {
                    element.checked = true;
                } else {
                    element.checked = false;
                }
            }
            element.dispatchEvent(new Event('change'));
        }
    }

    async bindSelectOne(element, data) {

        await this.spappFetch.comboDinamico(element);
        element.value = data[element.getAttribute('spapp-bind')];
    }
}