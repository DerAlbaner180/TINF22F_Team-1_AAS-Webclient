import React, { useEffect } from "react";
import { checkURL } from "./backend";

export function render() {
}

const AssetBody = () => {

    useEffect(() => {
        // Hier wird die Funktion getSubmodel() aufgerufen, sobald das Element im DOM vorhanden ist
        getSubmodel()
        
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
        for (let button of buttons) {
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
    

    async function getSubmodel() {

        let assetID= document.getElementById("aasID").innerHTML
        console.log("Hier value:")

        console.log(assetID)
        let url = window.sessionStorage.getItem('url');
        let urlSub;
        if (url.toLowerCase().endsWith("/")) {
            urlSub = url;
            url = url + "shells";
        } else if (url.toLowerCase().endsWith('/shells')) {
            urlSub = url.slice(0, -7);
        } else {
            url = url + "/shells";
        }
    
        let shells = await fetch(url);
        let shellsJson = await shells.json();
        let shellsArray = shellsJson.result;

        /*

        for (let asset in shellsArray){
            if(asset.id===assetID){

                
                let submodelsVonObjekt = asset.submodels;
            
                    for (let n = 0; n < submodelsVonObjekt.length; n++) {
                        let submodelKeys = submodelsVonObjekt[n].keys;
            
                        for (let key of submodelKeys) {
                            let key64 = btoa(key.value);
                            let submodelResponseUrl = urlSub + "/submodels/" + key64;
            
                            let submodelBom = await fetch(submodelResponseUrl);
                            let submodelBomJson = await submodelBom.json();
            
                            // Erstellen eines <div> Elements für das Submodel-Key
                            let div = document.createElement("div");
                            div.textContent = key.value; // Hier könnte auch key.idShort verwendet werden, je nach Bedarf
                            document.querySelector('.submodels').appendChild(div);
            
                            if (submodelBomJson.idShort === "BillOfMaterial" || submodelBomJson.idShort === "BoM" || submodelBomJson.idShort === "BillofMaterial") {
                                let elements = submodelBomJson.submodelElements;
            
                                // Erstellen eines <div> Elements für die Submodelelemente
                                let submodelElementsDiv = document.createElement("div");
            
                                // Durchlaufen der Submodelelemente und sie als <p> Elemente hinzufügen
                                elements.forEach(element => {
                                    let p = document.createElement("p");
                                    p.textContent = element.idShort;
                                    submodelElementsDiv.appendChild(p);
                                });
            
                                // Hinzufügen des Submodelelemente <div> zum entsprechenden Submodel-Key <div>
                                div.appendChild(submodelElementsDiv);
                            }
                        }
                    }
                

            }
        }
        */
    
        
    }
    
    
    

    

    let shellBody = JSON.parse(window.sessionStorage.getItem("shellBody"));

    if (window.sessionStorage.getItem("shellBody") !== null) {
        const shell = shellBody.read;


        return (
            <div className="m-2 p-2 overflow-auto w-100">
                <h3 className="">{shell.idShort}</h3>

                <div className={"d-flex flex-column my-3"}>
                    <div className={"d-flex flex-row"}>
                        <div className="image-container border">
                            <a href={shell.image}>
                                <img
                                    src={(shell.image == null) ? 'https://de.ingrammicro.com/_layouts/images/CSDefaultSite/common/no-image-lg.png' : shell.image}
                                    alt={""} className="asset-image" />
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
                                                            <p className="key" >{key}</p>
                                                            <p className="value" id="aasID">{value === '' ? '-' : value}</p>
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
