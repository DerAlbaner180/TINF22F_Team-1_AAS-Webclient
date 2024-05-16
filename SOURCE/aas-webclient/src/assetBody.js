import React, { useEffect } from "react";
import { checkURL } from "./backend";

export function render() {
}

const AssetBody = () => {

    useEffect(() => {
        // Hier wird die Funktion getSubmodel() aufgerufen, sobald das Element im DOM vorhanden ist
        
        
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
                                                 <div>{key}</div>
                                                 <p id={value} > {value === '' ? '-' : value}</p>
                                                 <p id={`idShort-${value}`}></p>
                                                <div id={`submodelElements-${value}`} onLoad={getSubmodel(value)}></div>
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
    

    async function getSubmodel(modelID) {
        //Kommt an und ist submodel URL
        let assetID= modelID

        console.log("SUBMODEL:"+assetID)

        //Das kommt weil ich die Server URL brauche aber ohne "/shells" damit ich die submodels abrufen kann
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

        //Die Submodel URL muss base64 encoded werden damit die JSON abgerufen werden kann
        let asset64= btoa(assetID)
        
        //hier wird das Submodel JSON abgerufen
        let bestimmtesAsset= await fetch(urlSub+"/submodels/"+asset64)

        //Hier wird die Response umgewandelt
        let bestimmtesAssetJson= await bestimmtesAsset.json()

        //Test
        console.log("ASSET")
        console.log(bestimmtesAssetJson)

        console.log(bestimmtesAssetJson.idShort)

        document.getElementById("idShort-"+assetID).innerHTML = bestimmtesAssetJson.idShort;

        console.log(bestimmtesAssetJson.idShort)

        if (bestimmtesAssetJson.idShort === "BillOfMaterial" || bestimmtesAssetJson.idShort === "BoM" || bestimmtesAssetJson.idShort === "BillofMaterial"){
        //hier aus dem Submodel das submodel Array Elements gezogen
        let submodelElementsList= bestimmtesAssetJson.submodelElements

        console.log("Submodel Elements")
        console.log(submodelElementsList)
        for(let i= 0; i<submodelElementsList.length; i++){
            let pElement= document.createElement('p')

            pElement.innerHTML=submodelElementsList[i].idShort

            document.getElementById("submodelElements-"+assetID).appendChild(pElement)
        }

        
        

        }

        
/*
        for (let n = 0; n < submodelsVonObjekt.length; n++) {
            let submodelKeys = submodelsVonObjekt[n].keys;

            for (let key of submodelKeys) {
                let key64 = btoa(key.value);
                let submodelResponseUrl = urlSub + "/submodels/" + key64;

                let submodelBom = await fetch(submodelResponseUrl);
                let submodelBomJson = await submodelBom.json();

                
                if (submodelBomJson.idShort === "BillOfMaterial" || submodelBomJson.idShort === "BoM" || submodelBomJson.idShort === "BillofMaterial") {
                    let elements = submodelBomJson.submodelElements;

                    console.log("bom")
                    console.log(elements)
                }
            }
        }

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
                        <div className={"d-flex flex-column navigation-buttons"} >
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
