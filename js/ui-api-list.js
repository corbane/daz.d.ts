//@ts-check

import * as Api from "./api.js"

/** @type {HTMLElement} */
var ulElement

/**
 * @param {HTMLElement} ul 
 */
export function init (ul)
{
    ulElement = ul
    //@ts-ignore
    document.getElementById ("api-list-filter").addEventListener ("input", e => filter (e.target.value))
    Api.on ("change:apiList", onApiListChange)
}

function onApiListChange ()
{
    const files = Api.getFiles ()
    ulElement.innerHTML = ""
    for (var i = 0 ; i < files.length ; i++)
    {
        const f = files[i]
        const c = f.getApiCode ()
        
        const li = document.createElement ("li")
        li.innerHTML = c ? `${c} ${f.name}` : `&nbsp;&nbsp;&nbsp;&nbsp;${f.name}`
        li.dataset.apiIndex = i.toString ()
        li.classList.add ("display-container", "padding-small")
        if (f.getContent () == null) li.style.color = "red"

        //@ts-ignore
        li.ApiFile = f
        li.addEventListener ("click", e => setSelectedApi (e.target["ApiFile"]))

        switch (c)
        {
        case "UNK": li.style.color = "orange"
        }
        
        ulElement.append (li)
    }
}

/**
 * @param {string} str 
 */
export function filter (str)
{
    const children = ulElement.children
    if (str == null || str.trim () == "")
    {
        for (var i = 0 ; i < children.length ; i++)
        {
            var c = children[i]
            if (c instanceof HTMLElement)
                c.style.display = "block"
        }
    }
    else
    {
        for (var i = 0 ; i < children.length ; i++)
        {
            var c = children[i]
            if (c instanceof HTMLElement)
                c.style.display = c.textContent.indexOf (str) < 0 ? "none" : "block"
        }
    }
}

/** @typedef {"change:selectedApi"} ApiStateEvents */

/**
 * @param {ApiStateEvents} event 
 * @param {(e: ApiStateEvents) => void} func 
 */
export function on (event, func)
{
    document.addEventListener (event, e => func (event))
}

/** @type {Api.File} */
var selectedApi

/** @type {HTMLElement} */
var selectedLi

export function getSelectedApi ()
{
    return selectedApi
}

/**
 * @param {Api.File} file
 */
export function setSelectedApi (file)
{
    if (selectedApi == file)
        return

    if (selectedLi != null)
        selectedLi.classList.remove ("selected")

    selectedApi = file
    document.dispatchEvent (new CustomEvent ("change:selectedApi"))

    if (selectedApi == null)
        return
    
    const ul = document.getElementById ("api-list")
    //@ts-ignore
    selectedLi = ul.children[selectedApi.getIndex ()]
    selectedLi.classList.add ("selected")
}
