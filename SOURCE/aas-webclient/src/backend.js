import {index, Main} from "./index";

export let controller = new AbortController();
console.log("Start");
async function getData(url) {
    if (url.search("http") === -1) {
        alert("Not a correct url");
        return undefined;
    }

    controller = new AbortController();
    console.log("Get data of:"+url);

    return fetch(url, {
        signal: controller.signal,
        mode: "cors"
    })
        .then(response => {
            console.log(response)
            return response.json().then(jsonResponse => {
                console.log(jsonResponse)
                return jsonResponse;
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        });
}

function getLangString(json) {
    if ("langStrings" in json) {
        let langStrings = json.langStrings
        for (let langPref of ["de", "en"]) {
            for (let langString of langStrings) {
                if (langString.language === langPref) {
                    return langString.text;
                }
            }
        }
    }
    return "";
}

function extractData(element, id, path, api) {
    let url = window.sessionStorage.getItem("url");
    url += "submodels/" + btoa(id) + "/submodelelements";
    let returnObject = {};

    if (api === 3) {
        for (let nameplateElement of element) {
            if (nameplateElement.modelType === "MultiLanguageProperty") {
                returnObject[nameplateElement.idShort] = getLangString(nameplateElement.value);
            } else if (nameplateElement.modelType === "SubmodelElementCollection") {
                returnObject[nameplateElement.idShort] = extractData(nameplateElement.value, id, path + (path.length > 0 ? "." : "") + nameplateElement.idShort, api);
            } else if (nameplateElement.modelType === "Property") {
                returnObject[nameplateElement.idShort] = nameplateElement.value;
            } else if (nameplateElement.modelType === "File") {
                returnObject["FilePath"] = url + "/" + path + "." + nameplateElement.idShort + "/attachment";
                returnObject[nameplateElement.idShort] = nameplateElement.value;
            }
        }
    } else {
        for (let nameplateElement of element) {
            if (nameplateElement.modelType.name === "MultiLanguageProperty") {
                returnObject[nameplateElement.idShort] = getLangString(nameplateElement.value);
            } else if (nameplateElement.modelType.name === "SubmodelElementCollection") {
                returnObject[nameplateElement.idShort] = extractData(nameplateElement.value, id, path + (path.length > 0 ? "." : "") + nameplateElement.idShort, api);
            } else if (nameplateElement.modelType.name === "Property") {
                returnObject[nameplateElement.idShort] = nameplateElement.value;
            } else if (nameplateElement.modelType.name === "File") {
                returnObject["FilePath"] = url + "/" + path + "." + nameplateElement.idShort + "/attachment";
                returnObject[nameplateElement.idShort] = nameplateElement.value;
            }
        }
    }

    return returnObject;
}

function searchForKey(json, regex) {
    let returnList = [];
    if (typeof json === "object") {
        for (let key in json) {
            if (regex.test(key) && json["FilePath"]) {
                returnList.push(json["FilePath"]);
            }
            returnList = returnList.concat(searchForKey(json[key], regex));
        }
    }
    return returnList;
}

async function getFullShellData() {
    window.sessionStorage.setItem("loaded", false);
    let apiVersion;
    let url = window.sessionStorage.getItem("url");
    if (!url.endsWith("/")) {
        url += "/";
        window.sessionStorage.setItem("url", url);
    }

    let shells = await getData(url + "shells").then( response => {
        if (response !== undefined) {
            //console.log(response)
            //console.log( typeof response);
            const entries= Object.entries(response)
            //console.log(entries)
            //console.log(entries[0][1])
            //console.log(entries[1])
            return entries[0][1].map(element => {
                if (!apiVersion) {
                    if (element["submodels"][0]["type"]) {
                        apiVersion = 3;
                    } else {
                        apiVersion = 1;
                    }
                    console.log(apiVersion);
                }

                let id = apiVersion === 3 ? element.id : element.identification.id;

                let submodelIds = [];
                if (element.submodels) {
                    //console.log("Element")
                    //console.log(element)

                    //console.log("Bildpfad: ")
                    //console.log(element.assetInformation.defaultThumbnail)
                    for (let i = 0; i < element.submodels.length; i++) {
                        if (element.submodels[i]["keys"][0]) {
                            submodelIds.push(
                                element.submodels[i]["keys"][0]["value"] //Submodelname
                            );
                        }
                    }
                }
                console.log("Submodels")
                for(let i=0; i<submodelIds.length;i++){
                    //console.log(submodelIds[i])

                }
                const mode=window.sessionStorage.getItem("mode");
                if (mode=="expert"){
                    return {
                        idShort: element.idShort,
                        id: id,
                        idEncoded: btoa(id),
                        apiVersion: apiVersion,
                        globalAssetId: element.assetInformation.globalAssetId,
                        Assetsubmodels: submodelIds
                    };

                }else {
                    return {
                        idShort: element.idShort,
                        id: id,
                    };
                }
            });
        }
    }).catch(err => {
        console.log(err)
        window.alert("Server lädt nicht")
    });

    if (shells !== undefined) {
        window.sessionStorage.setItem("shells", JSON.stringify(shells));

        console.log("Hier sind die Shells!!!!!!!!!"); //hier ist irgendwo der Fehler
        console.log(shells);

        window.sessionStorage.setItem("content", JSON.stringify(shells));
        index.render(<Main/>);

        console.log(shells);
        for (let i = 0; i < shells.length; i++) {
            await loadBody(shells[i]).then(shell => {
                window.sessionStorage.setItem("loaded", true);
                shells[i] = shell;
                console.log(shell); //hier irgendwo muss der Fehler sein
            });
            window.sessionStorage.setItem("shells", JSON.stringify(shells));
            index.render(<Main/>);
        }
        window.sessionStorage.setItem("content", JSON.stringify(shells));

        console.log(shells);
    }
}

async function loadBody(shell) {
    console.log("lade Body")
    let url = window.sessionStorage.getItem("url");
    url += "shells/" + (url.search("murr") === -1 ? btoa(shell.id) : encodeURIComponent(shell.id));
    url += (shell.apiVersion === 3 ? "/submodels" : "/aas/submodels");


    if (url.search("murr") !== -1) {
        let submodelData = [];
        await getData(url).then(element => {
            for (let i = 0; i < element.length; i++) {
                submodelData.push(element[i].idShort);
            }
        });
        shell.submodels = submodelData;
    }

    for (let i = 0; i < shell.submodels.length; i++) {
        await loadSubmodel(shell.submodels[i], url, shell.apiVersion).then(response => {
            if (response !== undefined) {
                shell[response.idShort] = response;
                let images = searchForKey(response, /[pP]roductImage\d*/);
                if (images.length > 0) {
                    shell["image"] = images[0];
                    console.log(images[0]);
                }
            }
        });
    }
    delete shell.submodels;
    return shell;
}

async function loadSubmodel(id, url, api) {
    url += "/" + (url.search("murr") === -1 ? btoa(id) : id) + "/submodel"
    return getData(url).then(element => {
        if (element !== undefined) {
            if (element.semanticId !== undefined) {
                return {
                    semanticId: (element.semanticId.keys[0] ? element.semanticId.keys[0].value : ""),
                    idShort: element.idShort,
                    id: element.id,
                    idEncoded: btoa(element.id),
                    ...extractData(element.submodelElements, element.id, "", api),
                }
            }
        }
    });
}

export {getFullShellData, loadBody}