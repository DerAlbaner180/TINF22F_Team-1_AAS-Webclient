import React, { useEffect } from "react";

export function render() {
}

const AssetBody = () => {

    useEffect(() => {
        // Hier wird die Funktion getSubmodel() aufgerufen, sobald das Element im DOM vorhanden ist
        getSubmodel();
    }, []);

    const changeContent = (event) => {
        clearView();
        document.getElementById(event.target.innerHTML).hidden = false;
        event.target.classList.add("bg-primary-subtle");
    };

    const clearView = () => {
        let children = document.getElementById("bodyContent").children;
        for (let child of children) {
            child.hidden = true;
        }
        let buttons = document.getElementsByClassName("navigation-button");
        for(let button of buttons){
            button.classList.remove("bg-primary-subtle");
        }
    };

    const buildBody = (json, id = "") => {
        let hidden = id !== "";
        if (id === "Nameplate") hidden = false;
        return (
            <table id={id} className="asset-table" hidden={hidden}>
                <tbody>
                {json ? (
                    Object.entries(json).map(([key, value]) => {
                        if (typeof value === "object") {
                            if (Object.keys(json[key]).length > 0) {
                                return (
                                    <tr>
                                        <td colSpan={2}>
                                            <div className="accordion" id="accordionExample">
                                                <div className="accordion-item">
                                                    <h2 className="accordion-header" id="headingOne">
                                                        <button
                                                            className="accordion-button collapsed"
                                                            type="button"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#${key}`}
                                                            aria-expanded="true"
                                                            aria-controls="collapseOne"
                                                        >
                                                            {key}
                                                        </button>
                                                    </h2>
                                                    <div
                                                        id={`${key}`}
                                                        className="accordion-collapse collapse"
                                                        aria-labelledby="headingOne"
                                                    >
                                                        <div className="accordion-body">
                                                            {buildBody(json[key])}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                        } else {
                            if (key !== "idShort") {
                                return (
                                    <tr>
                                        <td>
                                            <p className="key">{key}</p>
                                            <p className="value">Submodel ID: <div className="submodelIDValue">{value === '' ? '-' : value}</div></p>
                                            <div className="submodels"></div>
                                            <hr></hr>
                                        </td>
                                    </tr>
                                );
                            }
                        }
                    })) : (<tr></tr>)}
                </tbody>
            </table>
        );
    };
//Verarbeitet BoM
function createDivsForInformation(json) {
    const container = document.createElement("div");

    // Erstelle ein Div für jede Information im JSON
    for (const entry of json.submodelElements) {
        const div = document.createElement("div");
        div.classList.add("entry");

        const idShort = document.createElement("p");
        idShort.textContent = `ID Short: ${entry.idShort}`;
        div.appendChild(idShort);

        const globalAssetId = document.createElement("p");
        globalAssetId.textContent = `Global Asset ID: ${entry.globalAssetId}`;
        div.appendChild(globalAssetId);

        container.appendChild(div);
    }

    return container;
}

async function getSubmodel() {
    let serverUrl = window.sessionStorage.getItem('url');

    let submodelIDValue = document.querySelector('.submodelIDValue').innerHTML;

    let submodelBase64 = btoa(submodelIDValue);

    if (serverUrl.endsWith('/')) {
        // Hier muss nichts passieren
    } else {
        serverUrl = serverUrl + '/';
    }

    let submodelFetch = await fetch(serverUrl + 'submodels/' + submodelBase64);

    console.log('Hier der fetch');
    console.log(submodelFetch);

    let submodelValues = await submodelFetch.json();
    console.log('Hier sind die Values:');
    console.log(submodelValues);

    // Erstelle die Divs für die erhaltenen Informationen
    let divs = createDivsForInformation(submodelValues);

    // Wähle das Container-Element mit der Klasse "submodels" aus und füge die erstellten Divs hinzu
    const submodelsContainer = document.querySelector('.submodels');
    submodelsContainer.innerHTML = ''; // Leere den Container, falls bereits Elemente vorhanden sind
    submodelsContainer.appendChild(divs);
}


    let shellBody = JSON.parse(window.sessionStorage.getItem("shellBody"));

    if (window.sessionStorage.getItem("shellBody") !== null) {
        const shell=shellBody.read;

        return (
            <div className="m-2 p-2 overflow-auto w-100">
                <h3 className="">{shell.idShort}</h3>

                <div className={"d-flex flex-column my-3"}>
                    <div className={"d-flex flex-row"}>
                        <div className="image-container border">
                            <a href={shell.image}>
                                <img
                                    src={(shell.image == null) ? 'https://de.ingrammicro.com/_layouts/images/CSDefaultSite/common/no-image-lg.png' : shell.image}
                                    alt={""} className="asset-image"/>
                            </a>
                        </div>

                        <div>
                            <table>
                                <tbody>
                                {Object.entries(shell).map(([key, value]) => {
                                    if (typeof value !== "object" && key !== "idShort") {
                                        if (value.toString().search("attachment") === -1) {
                                            return (
                                                <tr>
                                                    <td>
                                                        <p className="key">{key}</p>
                                                        <p className="value">{value === '' ? '-' : value}</p>
                                                        <hr></hr>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    }
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <hr></hr>
                    <div className={"d-flex flex-row"}>
                        <div className={"d-flex flex-column navigation-buttons"}>
                            {Object.entries(shell).map(([key, value]) => {
                                if (typeof value === "object" && shell[key] !== null) {
                                    return (
                                        <div onClick={changeContent}
                                             className="navigation-button my-2 shadow-sm border rounded">
                                            {key}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                        <div id={"bodyContent"} className="flex-grow-1">
                            {Object.entries(shell).map(([key, value]) => {
                                if (typeof value === "object") {
                                    return buildBody(shell[key], key);
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return <div></div>;
    }
};

export default AssetBody;
