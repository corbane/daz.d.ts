//@ts-check
/// <reference path="globals.d.ts" />

import * as ApiFormatter from "./cmd-api-formatter.js"
import * as Ast from "./ast.js"
import * as Api from "./api.js"
import * as Sdk from "./sdk.js"
import * as ApiList from "./ui-api-list.js"
import * as ApiEditor from "./ui-api-editor.js"
import * as OutEditor from "./ui-out-editor.js"


export async function init ()
{
    await ApiList.init (document.getElementById ("api-list"))
    // Initialize OutEditor before ApiEditor for correct custom lannguage
    await OutEditor.init (document.getElementById ("output"))
    await ApiEditor.init (document.getElementById ("input"))
    await Api.init ()
    await ApiFormatter.init ()
    await Ast.init ()
    await Sdk.init ()

    ApiList.on ("change:selectedApi", onSelectedApiChange)
    OutEditor.on ("change:message", () => onOutMessage (OutEditor.getMessage ()))
    ApiEditor.on ("change:code", async () => ApiEditor.runCommand ("sdk-diff"))
    ApiEditor.on ("change:message", () => onApiMessage (ApiEditor.getMessage ()))
    ApiFormatter.on ("change:message", () => onApiMessage (ApiFormatter.getMessage ()))
    Sdk.on ("change:message", () => onOutMessage (Sdk.getMessage ()))
}

function onSelectedApiChange ()
{
    ApiEditor.useFile (ApiList.getSelectedApi ())
    OutEditor.useFile (ApiList.getSelectedApi ())
}

function onApiMessage (msg)
{
    const elm = document.getElementById ("api-message")
    elm.classList.remove ("info", "error")
    elm.classList.add (msg.level)
    elm.innerHTML = msg.text
}

function onOutMessage (msg)
{
    const elm = document.getElementById ("out-message")
    elm.classList.remove ("info", "error")
    elm.classList.add (msg.level)
    elm.innerHTML = msg.text
}


