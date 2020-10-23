const { ipcRenderer: ipc } = require('electron');
/* Alerts */
const Swal = require('sweetalert2')

function goToRunt() {
    $('#form-container').hide();
    $('#runt-webview').show();
};

const runtWebview = document.getElementById('runt-webview');
const paynetWebview = document.getElementById('paynet-webview');

const checkPaynetCredentials = async () => {
    let credentials = localStorage.getItem('paynet-credentials');
    if (!credentials) {
        const { value: formValues } = await Swal.fire({
            title: 'Es la primera vez que usas la aplicacion, por favor ingresa tus credenciales Paynet.',
            html: `
            <div class="w-full">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Nombre de Usuario
                        </label>
                        <input required id="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Nombre de Usuario">
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Clave
                        </label>
                        <input required id="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
                    </div>
                </form>
            </div>`,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                }
            }
        })
        if (formValues && formValues.username && formValues.password) {
            localStorage.setItem('paynet-credentials', JSON.stringify(formValues));
            paynetWebview.send('paynetCredentials', formValues);
        }
    } else {
        paynetWebview.send('paynetCredentials', JSON.parse(credentials));
    }

};


setTimeout(async () => {
    // runtWebview.openDevTools();
    // paynetWebview.openDevTools();
}, 500);

ipc.on('vehicleData', (event, props) => {
    $('#status-report').hide('');
    $('#status-report').html('');
    if (props.type === 'vehicleInfo') {
        var statusContent = '<span>Recibiendo Informacion del Vehiculo!</span>';
        $('#status-report').show();
        $('#status-report').append(statusContent);
        setTimeout(() => {
            $('#status-report').hide();
        }, 2500);
    }
    if (props.type === 'otherInfo') {
        var statusContent = '<span>Recibiendo Informacion Adicional!</span>';
        $('#status-report').show();
        $('#status-report').append(statusContent);
        setTimeout(() => {
            $('#status-report').hide();
        }, 2500);
    }

    if (props.type === 'done') {
        setTimeout(async () => {
            $('#runt-webview').hide();
            $('#paynet-webview').show();
            runtWebview.send('newRequest', true);
            await checkPaynetCredentials();
        }, 3000);
    }


    // Swal.fire({
    //     title: 'Información obtenida!',
    //     text: 'Se ha consultado la informacion correctamente',
    //     html: `
    //         <ul>
    //             <li> Marca: ${props.make} </li>
    //             <li> Modelo: ${props.model} </li>
    //             <li> Color: ${props.color}</li>
    //             <li> Linea:${props.line} </li>
    //             <li> Estado de Vehiculo: ${props.state}</li>
    //             <li> Estado Soat: ${props.soatState} </li>
    //             <li> Estado Ultima Solicitud: ${props.lastRequestState}</li>
    //             <li> Entidad Ultima Solicitud: ${props.lastRequestEntity}</li>
    //         </ul>
    //     `,
    //     icon: 'success'
    // });

    // $('#form-container').show();

});