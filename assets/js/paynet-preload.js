const { ipcRenderer: ipc } = require('electron');
const path = require('path')
ipc.on('paynetCredentials', async (event, props) => {
    await setUsername(props.username);
    await setPassword(props.password);
});
/* Add listener for when the content is loaded */
document.addEventListener('DOMContentLoaded', async (event) => {
    window.$ = window.jQuery = require(path.join(__dirname, '/jquery-3.5.1.min.js'));

    /* Add timeout to prevent errors (button not rendered) */
    setTimeout(async () => {
        // await login();
    }, 3000);

}, false);

const setUsername = async (username) => {
    const usernameInput = $('#ctl00_cph_StormLogin_UserName');
    usernameInput.val(username);
};

const setPassword = async (password) => {
    const passwordInput = $('#ctl00_cph_StormLogin_Password');
    passwordInput.val(password);
};

const login = async () => {
    const loginBtn = $('#ctl00_cph_StormLogin_LoginButton');
    loginBtn.click();
};