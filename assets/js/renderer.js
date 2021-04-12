/* IPC */
const { ipcRenderer: ipc } = require("electron");
/* Alerts */
const Swal = require("sweetalert2");
/* Runt */
const runtWebview = document.getElementById("runt-webview");
const moment = require("moment");
/* Sicre */
const sicreWebview = document.getElementById("sicre-webview");
/* Crypto */
var CryptoJS = require("crypto-js");
const secretKey = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const log = require("electron-log");

let currentSicreState;

/* Capture navigation events */
sicreWebview.addEventListener("did-stop-loading", (event) => {
  if (currentSicreState == "login") {
    console.log("login");
    const username = localStorage.getItem("sicov-username");
    const password = localStorage.getItem("sicov-password");
    let bytes = CryptoJS.AES.decrypt(password, secretKey);
    let descryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    const data = {
      username: username,
      password: descryptedPassword,
    };
  }
  if (currentSicreState == "enter-plate") {
    const plate = localStorage.getItem("plate");
    const revisionType = localStorage.getItem("revision-type");
    const vehicleType = localStorage.getItem("vehicle-type");
    const documentNumber = localStorage.getItem("document-number");
    const documentType = localStorage.getItem("document-type");
    const pinNumber = localStorage.getItem("pin-number");
    const pinValue = localStorage.getItem("pin-value");
    const foreignVehicle = localStorage.getItem("foreign-vehicle");
    const data = {
      plate: plate,
      revisionType: revisionType,
      vehicleType: vehicleType,
      documentType: documentType,
      documentNumber: documentNumber,
      pinNumber: pinNumber,
      pinValue: pinValue,
      foreignVehicle: foreignVehicle,
    };
    sicreWebview.send("enter-plate", data);
    currentSicreState = "plate-entered";
  }
});
const togglePassword = (value) => {
  if (value === "sicov") {
    const sicovPassword = $("#sicov-password");
    sicovPassword.attr("type") === "password"
      ? sicovPassword.attr("type", "text")
      : sicovPassword.attr("type", "password");
  }
};
ipc.on("info-entered", (event, props) => {
  $("#status-report").html("");
  var statusContent =
    '<span>Por favor, verifique la información y haga click en "Formalizar revisión"</span>';
  $("#status-report").append(statusContent);
  $("#status-report").show();
});
ipc.on("openConsole", (event, props) => {
  switch (props.platform) {
    case "RUNT":
      runtWebview.openDevTools();
      break;
    case "PAYNET":
      paynetWebview.openDevTools();
      break;
    case "SICOV":
      sicreWebview.openDevTools();
      break;

    default:
      break;
  }
});
sicreWebview.addEventListener("did-navigate", (event) => {
  console.log("did-navigate", event.url);
  if (event.url.indexOf("Default") >= 0) {
    console.log("here");
    currentSicreState = "login";
  } else if (event.url.indexOf("SeleccionarSucursal") >= 0) {
    $("#status-report").html("");
    var statusContent = "<span>Por favor seleccione la sucursal</span>";
    $("#status-report").append(statusContent);
    $("#status-report").show();
    sicreWebview.send("sucursal-selection", true);
  } else if (event.url.indexOf("?Placa") >= 0) {
    $("#status-report").html("");
    var statusContent = "<span>Ingresando información!</span>";
    $("#status-report").append(statusContent);
    $("#status-report").show();
    sicreWebview.send("input-form-data", true);
  } else if (event.url.indexOf("FormalizacionRevision") >= 0) {
    if (currentSicreState !== "plate-entered") {
      currentSicreState = "enter-plate";
    } else {
      // Revision finished
      console.log("finished by url");
      $("#status-report").show();
      $("#status-report").html("");
      var statusContent = "<span>¡Formalización realizada!</span>";
      $("#status-report").append(statusContent);
      setTimeout(() => {
        $("#status-report").html("");
        $("#status-report").hide();
      }, 3000);

      $("#runt-step").removeClass("done");
      $("#initial-step").addClass("current").removeClass("done");
      $("#sicre-webview").hide();
      $("#initial-form").show();
    }
  }
});

function goToRunt() {
  $("#runt-webview").attr(
    "src",
    "https://www.runt.com.co/consultaCiudadana/#/consultaVehiculo"
  );
  setTimeout(() => {
    $("#initial-form").hide();
    $("#runt-webview").show();
    $("html,body").scrollTop(0);
    $("#initial-step").removeClass("current").addClass("done");
    $("#runt-step").addClass("current");
    /* Store the value of the selected vehicle type */
    const plate = $("#vehicle-plate").val();
    const foreignVehicle = $(
      "input[name=foreign-vehicle]:checked",
      "#revision-form"
    );
    const documentNumber = $("#document-number");
    const documentType = $("#document-type");
    const cellphone = $("#cellphone");
    const revisionType = $("#revision-type");
    const vehicleType = $("#vehicle-type-select");
    localStorage.setItem("vehicle-type", vehicleType.val());
    localStorage.setItem("foreign-vehicle", foreignVehicle.val());
    localStorage.setItem("plate", plate.toUpperCase());
    localStorage.setItem("document-number", documentNumber.val());
    localStorage.setItem("document-type", documentType.val());
    localStorage.setItem("cellphone", cellphone.val());
    localStorage.setItem("revision-type", revisionType.val());
    const formData = {
      plate: plate.toUpperCase(),
      documentType: documentType.val(),
      documentNumber: documentNumber.val(),
      procedencia: foreignVehicle.val(),
    };
    runtWebview.send("runt-form-data", formData);
  }, 1000);
}

function sicovInputChange() {
  const sicovUsername = $("#sicov-username");
  const sicovPassword = $("#sicov-password");
  const sicovUrl = $("#sicov-url");
  const syncUrl = $("#sync-url");
  if (
    sicovUsername.val() &&
    sicovPassword.val() &&
    sicovUrl.val() &&
    syncUrl.val()
  ) {
    $("#sicov-btn-disabled").hide();
    $("#sicov-btn-enabled").show();
  }
}

function initialFormChange() {
  const plate = $("#vehicle-plate");
  const documentNumber = $("#document-number");
  const documentType = $("#document-type");
  const cellphone = $("#cellphone");
  const revisionType = $("#revision-type");
  const vehicleType = $("#vehicle-type-select");
  if (revisionType.val()) {
    $("#revision-type").addClass("is-dirty");
  } else {
    $("#revision-type").removeClass("is-dirty");
  }
  if (documentType.val()) {
    $("#document-type").addClass("color", "black");
  } else {
    $("#document-type").removeClass("is-dirty");
  }
  if (vehicleType.val()) {
    $("#vehicle-type-select").addClass("color", "black");
  } else {
    $("#vehicle-type-select").removeClass("is-dirty");
  }
  if (
    plate.val() &&
    documentNumber.val() &&
    cellphone.val() &&
    documentType.val() &&
    revisionType.val() &&
    vehicleType.val()
  ) {
    $("#continue-disabled").hide();
    $("#continue-img").show();
  } else {
    $("#continue-disabled").show();
    $("#continue-img").hide();
  }
}

function logout() {
  Swal.fire({
    title: "Cerrar sesión",
    text: "¿Desea finalizar la sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#79c5b4",
    cancelButtonColor: "#e88aa2",
    confirmButtonText: "Cerrar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      let sicovUsername = localStorage.getItem("sicov-username");
      let savedSicovUrl = localStorage.getItem("sicov-url");
      let savedSyncUrl = localStorage.getItem("sync-url");
      localStorage.clear();
      localStorage.setItem("sicov-username", sicovUsername);
      localStorage.setItem("sicov-url", savedSicovUrl);
      localStorage.setItem("sync-url", savedSyncUrl);
      $("#login-container").css("display", "flex");
      $("#form-container").hide();
      $("#progress-bar").show();
      $("#initial-form").css("display", "flex");
      $("#status-report").html("");
      $("#status-report").hide();
      $("#failed-revisions").hide();
      $("#runt-webview").hide();
      $("#sicre-webview").hide();
      $("#runt-step").removeClass("done");
      $("#sicre-step").removeClass("done");
      $("#runt-step").removeClass("current");
      $("#sicre-step").removeClass("current");
      $("#initial-step").addClass("current").removeClass("done");
      $("#sicov-password").val("");
      sicreWebview.send("logOut", true);
    }
  });
}

function validateFields() {
  const plate = $("#vehicle-plate");
  const documentNumber = $("#document-number");
  const documentType = $("#document-type");
  const cellphone = $("#cellphone");
  const revisionType = $("#revision-type");
  const vehicleType = $("#vehicle-type-select");
  if (!plate.val()) {
    plate.focus();
    return false;
  }
  if (!documentType.val()) {
    $("#document-type").focus();
    return false;
  }
  if (!documentNumber.val()) {
    documentNumber.focus();
    return false;
  }

  if (!cellphone.val()) {
    cellphone.focus();
    return false;
  }
  if (!revisionType.val()) {
    $("#revision-type").focus();
    return false;
  }

  if (!vehicleType.val()) {
    vehicleType.focus();
    return false;
  }
}

function showForm() {
  $("#status-report").html("");
  var statusContent = "<span>Iniciando Sesión!</span>";
  $("#status-report").append(statusContent);
  $("#status-report").show();
  const sicovUsername = $("#sicov-username");
  const sicovPassword = $("#sicov-password");
  const sicovUrl = $("#sicov-url");
  const syncUrl = $("#sync-url");
  localStorage.setItem("sicov-url", sicovUrl.val());
  localStorage.setItem("sync-url", syncUrl.val());
  $("#sicre-webview").attr("src", sicovUrl.val());
  formData = new FormData();
  formData.append("username", sicovUsername.val());
  formData.append("password", sicovPassword.val());
  $("#status-report").html("");
  $("#status-report").hide();
  $("#login-container").hide();
  $("#form-container").css("display", "flex");

  $("#header-user").text(sicovUsername.val());
  localStorage.setItem("sicov-username", sicovUsername.val());
  let encryptedSicovPassword = CryptoJS.AES.encrypt(
    sicovPassword.val(),
    secretKey
  ).toString();
  localStorage.setItem("sicov-password", encryptedSicovPassword);
  // localStorage.setItem('auth-token', response.token);
  // const sicreUrl = localStorage.getItem('sicre-url');
  // $('#sicre-webview').attr('src', sicreUrl);
}

const sendVehicleData = async () => {
  const documentType = localStorage.getItem("document-type");
  const plate = localStorage.getItem("plate");
  const documentNumber = localStorage.getItem("document-number");
  const model = localStorage.getItem("vehicle-model");
  const vehicleType = localStorage.getItem("vehicle-type");
  const cellphone = localStorage.getItem("cellphone");
};

function resumeRevision() {
  const plate = $("#selected-vehicle-plate").val();
  const pendingRevisions = localStorage.getItem("pending-revisions");
  if (pendingRevisions) {
    const revisions = JSON.parse(pendingRevisions);
    let index = 0;
    for (const revision of revisions) {
      if (revision.plate === plate) {
        revisions.splice(index, 1);
      }
      index++;
    }
    console.log(revisions);
    localStorage.setItem("pending-revisions", JSON.stringify(revisions));
    $(".list-container").empty();
    $("#selected-vehicle-plate").val("");
    $("#selected-vehicle-plate-container").removeClass("is-dirty");
    $("#selected-document-number").val("");
    $("#selected-document-number-container").removeClass("is-dirty");
    $("#selected-document-type").val("");
    $("#selected-document-type-container").removeClass("is-dirty");
    $("#selected-revision-type").val("");
    $("#selected-revision-type-container").removeClass("is-dirty");
    $("#selected-cellphone").val("");
    $("#selected-cellphone-container").removeClass("is-dirty");
    $("#selected-pin").val("");
    $("#selected-pin-container").removeClass("is-dirty");
    for (const revision of revisions) {
      const listItem = $(
        `<div id="${revision.plate}" onclick='selectRevision("${revision.plate}");' class='list-item'></div>`
      ).text(revision.plate);
      $(".list-container").append(listItem);
    }

    if (revisions.length) {
      const firstElement = revisions[0];
      $(`#${firstElement.plate}`).click();
    }
  }
}

function selectRevision(id) {
  $(".list-item").each(function (i, obj) {
    $(this).removeClass("is-selected");
  });
  const pendingRevisions = localStorage.getItem("pending-revisions");
  let selectedRevision;
  if (pendingRevisions) {
    const revisions = JSON.parse(pendingRevisions);
    for (const revision of revisions) {
      if (revision.plate === id) {
        selectedRevision = revision;
      }
    }
    if (selectedRevision) {
      $(`#${id}`).addClass("is-selected");
      console.log("se ha seleccionado", selectedRevision);
      $("#selected-vehicle-plate").val(selectedRevision.plate);
      $("#selected-vehicle-plate-container").addClass("is-dirty");
      $("#selected-document-number").val(selectedRevision.document);
      $("#selected-document-number-container").addClass("is-dirty");
      $("#selected-document-type").val(selectedRevision.documentType);
      $("#selected-document-type-container").addClass("is-dirty");
      $("#selected-revision-type").val(selectedRevision.revisionType);
      $("#selected-revision-type-container").addClass("is-dirty");
      $("#selected-cellphone").val(selectedRevision.cellphone);
      $("#selected-cellphone-container").addClass("is-dirty");
      $("#selected-pin").val(selectedRevision.pin);
      $("#selected-pin-container").addClass("is-dirty");
    }
  }
}

function showRunt() {
  $("#runt-webview").attr(
    "src",
    "https://www.runt.com.co/consultaCiudadana/#/consultaVehiculo"
  );
  $("#initial-form").css("display", "none");
  $("#sicre-webview").hide();
  $("#runt-step").addClass("current");
  $("#sicre-step").removeClass("current");
  $("#runt-webview").show();
}

function showSicov() {
  $("#initial-form").css("display", "none");
  $("#paynet-webview").hide();
  $("#runt-webview").hide();
  $("#runt-step").removeClass("current");
  $("#sicre-step").addClass("current");
  $("#sicre-webview").show();
}

function resetForm() {
  $("#vehicle-plate").val("");
  $("#document-number").val("");
  $("#cellphone").val("");
  $("#document-type").val("");
  $("#revision-type").val("70");
  $("#vehicle-type-select").val("");
}

function showInitialForm() {
  runtWebview.send("newRequest", true);
  resetForm();
  $("#initial-form").css("display", "flex");
  $("#status-report").html("");
  $("#status-report").hide();
  $("#progress-bar").show();
  $("#failed-revisions").hide();
  $("#runt-webview").hide();
  $("#sicre-webview").hide();
  $("#runt-step").removeClass("done");
  $("#sicre-step").removeClass("done");
  $("#runt-step").removeClass("current");
  $("#sicre-step").removeClass("current");
  $("#initial-step").addClass("current").removeClass("done");
}

function showFailedRevisions() {
  $(".list-container").empty();
  const pendingRevisions = [];
  const pendingRevision = {
    plate: "HKQ558",
    document: "51914792",
    cellphone: "3217584129",
    pin: "123456",
    documentType: "C",
    revisionType: "Inicial",
  };
  const pendingRevision2 = {
    plate: "1HKQ558",
    document: "151914792",
    cellphone: "13217584129",
    pin: "1123456",
    documentType: "C",
    revisionType: "Inicial",
  };
  pendingRevisions.push(pendingRevision, pendingRevision2);
  localStorage.setItem("pending-revisions", JSON.stringify(pendingRevisions));

  $("#initial-form").hide();
  $("#runt-webview").hide();
  $("#sicre-webview").hide();
  $("#progress-bar").hide();
  $("#failed-revisions").css("display", "flex");

  for (const revision of pendingRevisions) {
    const listItem = $(
      `<div id="${revision.plate}" onclick='selectRevision("${revision.plate}");' class='list-item'></div>`
    ).text(revision.plate);
    $(".list-container").append(listItem);
  }

  const firstElement = pendingRevisions[0];
  $(`#${firstElement.plate}`).click();
}

const checkPaynetCredentials = async () => {};

setTimeout(async () => {
  // sicreWebview.openDevTools();
  // runtWebview.openDevTools();
}, 500);

ipc.on("revision-finished", (event, props) => {
  console.log("finished");
  sicreWebview.send("logOut", true);
  $("#status-report").show();
  $("#status-report").html("");
  var statusContent = "<span>¡Formalizacion realizada!</span>";
  $("#status-report").append(statusContent);
  setTimeout(() => {
    $("#status-report").html("");
    $("#status-report").hide();
  }, 3000);
  // let url = localStorage.getItem('sicre-url');
  // $('#sicre-webview').attr('src', url);
  $("#runt-step").removeClass("done");
  $("#sicre-step").removeClass("done");
  $("#sicre-step").removeClass("current");
  $("#initial-step").addClass("current").removeClass("done");
  $("#sicre-webview").hide();
  $("#initial-form").show();
  resetForm();
});

ipc.on("logEvent", (event, props) => {
  log.info(props);
});
// ipc.on('runtFormData', (event, props) => {
//     localStorage.setItem('document-type', props.documentType);
//     localStorage.setItem('plate', props.plate);
//     localStorage.setItem('document-number', props.documentNumber);
// });

ipc.on("paynetLogin", (event, props) => {});

ipc.on("pinCreated", (event, props) => {
  localStorage.setItem("pin-number", props.pin);
  const pinValue = props.pinValue;
  let parsedValue = pinValue.replace("$", "");
  console.log(parsedValue);
  parsedValue.replace(".", "");
  console.log(parsedValue);
  localStorage.setItem("pin-value", parsedValue);
  localStorage.setItem("transaction-number", props.transactionNumber);
  Swal.fire({
    title: "Pin generado!",
    text: "Se ha generado el pin correctamente. ¿Desea continuar a SICOV?",
    icon: "success",
    html: `
        <ul>
            <li> PIN: ${props.pin} </li>
            <li> Transacción Nro.: ${props.transactionNumber} </li>
            <li> Valor PIN: ${props.pinValue} </li>
        </ul>
        `,
    showCancelButton: true,
    confirmButtonColor: "#79c5b4",
    cancelButtonColor: "#e88aa2",
    confirmButtonText: "Continuar a SICOV",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const username = localStorage.getItem("sicov-username");
      const password = localStorage.getItem("sicov-password");
      let bytes = CryptoJS.AES.decrypt(password, secretKey);
      let descryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
      const data = {
        username: username,
        password: descryptedPassword,
      };
      log.info("[SICOV] Iniciando sesión");
      sicreWebview.send("start-login", data);
      // $('#status-report').show();
      // $('#status-report').html('');
      // var statusContent = '<span>Cargando SICRE</span>';
      // $('#status-report').append(statusContent);
      $("#status-report").html("");
      var statusContent = "<span>Iniciando sesión.</span>";
      $("#status-report").append(statusContent);
      $("#status-report").show();
      $("#sicre-webview").show();
      $("html,body").scrollTop(0);
      $("#sicre-step").addClass("current");
    }
  });
});

ipc.on("runt-error", (event, props) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Ha ocurrido un error.",
    confirmButtonText: "Reintentar",
  }).then(async () => {
    $("#status-report").html("");
    $("#status-report").hide();
    $("#runt-webview").hide();
    $("#runt-webview").attr(
      "src",
      "https://www.runt.com.co/consultaCiudadana/#/consultaVehiculo"
    );
    $("#initial-form").show();
    $("#runt-step").removeClass("current");
    $("#initial-step").addClass("current").removeClass("done");
  });
});

ipc.on("pinRedirect", (event, props) => {
  $("#status-report").html("");
  var statusContent = "<span>Redireccionando a compra de PIN</span>";
  $("#status-report").append(statusContent);
});
ipc.on("loadingPinInfo", (event, props) => {
  $("#status-report").html("");
  $("#status-report").show();
  var statusContent =
    "<span>Ingresando información, por favor espere...</span>";
  $("#status-report").append(statusContent);
});

const submitData = async (data) => {
  //Get Settings

  let capacidadDeCarga = data.technicalData.totalPassengers
    ? data.technicalData.totalPassengers
    : "0";
  capacidadDeCarga = capacidadDeCarga.replace(/[^0-9.,]+/, "");
  const syncUrl = localStorage.getItem("sync-url");

  // console.log(settings.SICRE_URL);

  // $('#status-report').show();
  // $('#status-report').html('');
  // var statusContent = '<span>Sincronizando información</span>';
  // $('#status-report').append(statusContent);
  const plate = localStorage.getItem("plate");
  log.info(`Sincronizando placa: ${plate}`);
  const formData = {
    parametro: {
      placa: plate,
      Procedencia: data.procedencia,
      TipoServicio: data.serviceType,
      Clase: data.vehicleClass,
      Licencia: data.license,
      Marca: data.make,
      Linea: data.line,
      Modelo: data.model,
      CantSillas: data.technicalData.totalSeats,
      Color: data.color,
      Serie: data.serieNumber,
      MotorNo: data.motorNumber,
      Chasis: data.chasisNumber,
      VIN: data.vinNumber,
      Cilindraje: data.cylinderCapacity,
      Combustible: data.fuelType,
      FechaMatricula: moment(data.plateDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      CapacidadCarga: capacidadDeCarga,
      PesoBruto: data.technicalData.totalWeight,
      CapacidadPasajeros: data.technicalData.totalPassengers
        ? data.technicalData.totalPassengers
        : "0",
      CantEjes: data.technicalData.totalAxis,
      Blindado: data.armoredInfo.isArmored,
      NivelBlindaje: data.armoredInfo.armorLevel,
    },
  };
  console.log(formData);
  log.info(JSON.stringify(formData));

  $.ajax({
    type: "POST",
    url: syncUrl,
    data: JSON.stringify(formData),
    contentType: "application/json",
    dataType: "json",
    timeout: 18000,
    error: (request, status, error) => {
      log.warn("Error sincronizando");
      log.warn(status);
      log.warn(request.responseText);
      // $('#status-report').show();
      // $('#status-report').html('');
      // var statusContent = '<span>Error sincronizando Información</span>';
      // $('#status-report').append(statusContent);
      // setTimeout(() => {
      //     $('#status-report').html('');
      //     $('#status-report').hide();
      // }, 3000);
    },
    success: (response, status, jqXHQ) => {
      log.info("Información sincronizada");
      log.info(JSON.stringify(response));
      // $('#status-report').show();
      // $('#status-report').html('');
      // var statusContent = '<span>Información sincronizada exitosamente</span>';
      // $('#status-report').append(statusContent);
      // setTimeout(() => {
      //     $('#status-report').html('');
      //     $('#status-report').hide();
      // }, 3000);
    },
  });
};

ipc.on("infoCompleted", (event, props) => {
  $("#status-report").html("");
  var statusContent =
    '<span>Información completada, presione el botón "Siguiente"</span>';
  $("#status-report").append(statusContent);
});
ipc.on("nextPressed", (event, props) => {
  $("#status-report").html("");
  var statusContent = "<span>Por favor espere...</span>";
  $("#status-report").append(statusContent);
  $("#status-report").show("");
});

ipc.on("vehicleData", (event, props) => {
  if (props.type === "vehicleInfo") {
    $("#status-report").show();
    $("#status-report").html("");
    var statusContent = "<span>Consultando información del vehículo</span>";
    localStorage.setItem("vehicle-model", props.data.model);
    $("#status-report").append(statusContent);
  }
  if (props.type === "otherInfo") {
    $("#status-report").html("");
    var statusContent = "<span>Consultando información adicional</span>";
    $("#status-report").append(statusContent);
  }

  if (props.type === "done") {
    console.log("done", props);
    submitData(props.data);
    setTimeout(async () => {
      console.log("inside async", props);
      $("#status-report").html("");
      $("#status-report").hide();
      Swal.fire({
        title: "¡Información obtenida!",
        text:
          "Se ha consultado la información correctamente. ¿Desea continuar?",
        icon: "success",
        html: `
                <ul>
                    <li> Marca: ${props.data.make} </li>
                    <li> Modelo: ${props.data.model} </li>
                    <li> Color: ${props.data.color}</li>
                    <li> Línea:${props.data.line} </li>
                    <li> Licencia:${props.data.license} </li>
                    <li> Estado del vehículo: ${props.data.state}</li>
                    <li> Estado Soat: ${props.data.soat} </li>
                    <li> Último certificado: ${
                      props.data.certifications.type
                    } </li>
                    <li style="${
                      props.data.certifications.active == "NO"
                        ? "color:red;"
                        : ""
                    }" > Vigente: ${props.data.certifications.active} </li>
                    <li> Fecha vigencia: ${
                      props.data.certifications.expiration
                    } </li>
                    <li> Última solicitud: ${props.data.lastRequest.type}</li>
                    <li> Estado última solicitud: ${
                      props.data.lastRequest.lastRequestState
                    }</li>
                    <li> Entidad última solicitud: ${
                      props.data.lastRequest.lastRequestEntity
                    }</li>
                    <li> Fecha última solicitud: ${
                      props.data.lastRequest.lastRequestDate
                    }</li>
                </ul>
                `,
        showCancelButton: true,
        confirmButtonColor: "#79c5b4",
        cancelButtonColor: "#e88aa2",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { value: formValues } = await Swal.fire({
            title: "Por favor, ingresa el pin de Supergiros para continuar..",
            html: `
                        <div class="w-full">
                            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div class="mb-4">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="pin">
                                        PIN
                                    </label>
                                    <input required id="pin" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="pin" type="text" placeholder="Pin Supergiros">
                                </div>
                            </form>
                        </div>`,
            focusConfirm: false,
            preConfirm: () => {
              return {
                pin: document.getElementById("pin").value,
              };
            },
          });
          if (formValues && formValues.pin) {
            localStorage.setItem("pin-number", formValues.pin);
            $("#status-report").html("");
            var statusContent = "<span>Iniciando sesión.</span>";

            const username = localStorage.getItem("sicov-username");
            const password = localStorage.getItem("sicov-password");
            let bytes = CryptoJS.AES.decrypt(password, secretKey);
            let descryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
            const data = {
              username: username,
              password: descryptedPassword,
            };
            sicreWebview.send("start-login", data);
            log.info("[SICOV] Iniciando sesión");
            $("#status-report").append(statusContent);
            $("#status-report").show();
            $("#runt-webview").hide();
            $("#sicre-webview").show();
            log.info("[RUNT] Recargando RUNT");
            $("html,body").scrollTop(0);
            $("#sicre-step").addClass("current");
            $("#runt-step").removeClass("current").addClass("done");
            runtWebview.send("newRequest", true);
          }
        }
      });
    }, 1500);
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
