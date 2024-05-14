import React from 'react';
import "./style.css";
import {index, Main} from "./index";
import {loadBody} from "./backend";

export function openAsset() {
}


class Item extends React.Component {

    openAsset = (e) => {
        console.log(e)
        console.log("wird geöffnet")

        document.getElementById("")
        let parent = document.getElementById(this.props.shell.read.idShort).parentElement;
        console.log(this.props)
        let children = Array.from(parent.children);
        children.map(function (item){
        item.classList.remove("bg-primary-subtle");
        })
        document.getElementById(this.props.shell.read.idShort).classList.add("bg-primary-subtle");
        if (Object.keys(this.props.shell.read).includes("submodels")) {
            loadBody(this.props.shell.read).then(response => {
                
                window.sessionStorage.setItem("shellBody", JSON.stringify(response));
                index.render(<Main/>);
            });
        } else {
            window.sessionStorage.setItem("shellBody", JSON.stringify(this.props.shell));
            index.render(<Main/>);
        }
        document.getElementById("error_message_NextToSearchField").style.visibility = "hidden";
        
    }
    render() {
        let name = this.props.shell.read.idShort;
        let image = this.props.shell.image ? this.props.shell.image : "";

        return (
            <div id={name} onClick={this.openAsset} className={"item p-2 my-2 d-sm-flex justify-content-between align-items-center list-group-item-action list-group-item border shadow-sm rounded"}>
                <img style={{maxHeight: "50px"}} src={image} alt={""}/>
                <div>
                   {name}
                </div>
            </div>
        );
    }
}


export default Item;