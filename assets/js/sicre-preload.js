const { ipcRenderer: ipc } = require('electron');
const path = require('path');

let currentState;
/* Add listener for when the content is loaded */
document.addEventListener('DOMContentLoaded', async (event) => {

    // window.$ = window.jQuery = require(path.join(__dirname, '/jquery-1.11.1.min.js'));
    if (window.location.href === 'http://172.17.4.130:8055/Default') {
        await setTimeout(async () => {
            console.log('login');
            await setUsername('ultraconcept');
            await setPassword('Ultraconcept123*');
            await login();
        }, 1000);
    }



}, false);
ipc.on('sucursal-selection', async (event, props) => {
    console.log('se debe seleccionar la sucursal');
});

ipc.on('enter-plate', async (event, props) => {
    console.log('ingresando la placa', props);
    localStorage.setItem('plate', props.plate);
    localStorage.setItem('revisionType', props.revisionType);
    localStorage.setItem('vehicleType', props.vehicleType);
    localStorage.setItem('documentNumber', props.documentNumber);
    localStorage.setItem('pinNumber', props.pinNumber);
    await setPlate(props.plate);
    // await checkRevision();
});
const setUsername = async (username) => {
    const usernameInput = $('#txtEmail');
    usernameInput.val(username);
};

const setPassword = async (password) => {
    const usernameInput = $('#txtPassword');
    usernameInput.val(password);
};

const login = async () => {
    const loginBtn = $('#btnEntrar');
    loginBtn.click();
};

const setPlate = async (plate) => {
    const plateInput = $('#ctl00_body_txtPlaca');
    plateInput.val(plate);
    
};

const checkRevision = async () => {
    const checkRevisionBtn = $('#ctl00_body_btnConsultar');
    checkRevisionBtn.click();
};