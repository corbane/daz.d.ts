//@ts-check
/// <reference path="globals.d.ts" />

import * as Api from "./api.js"
import * as Tsd from "./tsd-generator.js"
import * as Sdk from "./sdk.js"
import { getDoc } from "./doc.js"
import * as ApiEditor from "./ui-api-editor.js"

/**
 * @type {monaco.editor.IStandaloneCodeEditor}
 * @private
 */
var meditor

/**
 * @type {"ast"|"sdk"|"tsd"|"all"|"doc"}
 * @private
 */
var showtype

/**
 * @type {Api.File}
 * @private
 */
var apifile

/** @private */
var regex_decl = /^(?:declare[ \t]+var|declare[ \t]+class|interface)[ \t]+([a-zA-Z0-9_]+)/

/**
 * @param {HTMLElement} el 
 */
export function init (el)
{
    showtype = "tsd"

    document.querySelectorAll ("[data-out-type]").forEach (elm => {
        //@ts-ignore
        elm.addEventListener ("change", (e) => show (e.target.dataset.outType))
    })
    document.getElementById ("bt-out-fold").addEventListener ("click", () => runCommand ("fold-all"))

    monaco.editor.setTheme ("vs")

    // monaco.languages.typescript.typescriptDefaults.addExtraLib (
    //     Tsd.generateAll (Api.getFiles ()),
    //     "daz.d.ts"
    // )

    meditor = monaco.editor.create(el, {
        theme: "vs",
        language: "typescript",
        value: "",
        automaticLayout: true,
        wordWrap: "on",
        wrappingIndent: "same"
    })

    meditor.onDidChangeCursorPosition (e =>
    {
        if (showtype != "all")
            return

        /** @type {string} */ var l
        /** @type {RegExpMatchArray|null} */ var r

        for (var i = e.position.lineNumber ; i > 0 ; i-- )
        {
            l = meditor.getModel ().getLineContent (i)
            r = l.match (regex_decl)
            if (r != null) {
                const f = Api.get (r[1])
                ApiEditor.useFile (f)
                return
            }
        }
    })
}

/** @param {Api.File} f */
export function useFile (f)
{
    apifile = f
    update ()
}

/** @param {"ast"|"sdk"|"tsd"|"all"|"doc"} type */
export function show (type)
{
    switch (type)
    {
    case "ast": break
    case "sdk": break
    case "tsd": break
    case "all": break
    case "doc": break
    default: return
    }

    showtype = type
    update ()
}

/** @typedef {"fold-all"} ApiEditorCommands */

/**
 * @param {ApiEditorCommands} cmd 
 */
export function runCommand (cmd)
{
    console.log ("run command: " + cmd)
    switch (cmd)
    {
    case "fold-all"    :  meditor.getAction ("editor.foldAll").run ()
    }
}

function update ()
{
    switch (showtype)
    {
    case null:
        setCode ("")
        return
    case "all":
        setCode (Tsd.generateAll (Api.getFiles ()), "typescript")
        return
    case "doc":
        setCode (getDoc (), "markdown")
        return
    }

    if (apifile == null) {
        setCode ("")
        return
    }
    
    switch (showtype)
    {
    case "ast":
        var a = apifile.getAst ()
        if (a) setCode (JSON.stringify (a, undefined, 2), "json")
        else setMessage ("error", apifile.error)
        break
    case "sdk":
        Sdk.get (apifile)
        .then (async sdk => sdk.getContent ())
        .then (cpp => setCode (cpp, "cpp"))
        .catch (() => setMessage ("error", `Cannot open ${apifile.name}`))
        break
    case "tsd":
        var s = apifile.getTsd ()
        if (s) setCode (s, "typescript")
        else setMessage ("error", apifile.error)
        break
    }
}

/** @typedef {"change:code"|"change:message"|"change:language"} OutEditorStateEvents */

/**
 * 
 * @param {OutEditorStateEvents} event 
 * @param {(e: OutEditorStateEvents) => void} func 
 */
export function on (event, func)
{
    document.addEventListener (event, e => func (event))
}

/**
 * @param {string} str
 * @param {OutLanguages} language
 */
function setCode (str, language = null)
{
    if (language != null) setLanguage (language)
    meditor.setValue (str ?? "")
    document.dispatchEvent (new CustomEvent ("change:code"))
}

/** @typedef {"json"|"javascript"|"typescript"|"cpp"|"text"|"markdown"} OutLanguages */

/**
 * @param {OutLanguages} language 
 */
function setLanguage (language)
{
    monaco.editor.setModelLanguage (meditor.getModel (), language)
    document.dispatchEvent (new CustomEvent ("change:language"))
}

/**
 * @type {{ level: "info"|"error", text: string}}
 * @private
 */
var _message = { level: "info", text: "loading..." }

export function getMessage ()
{
    return _message
}

/**
 * @param {"info"|"error"} level
 * @param {string} text
 */
function setMessage (level, text)
{
    _message = { level, text }
    document.dispatchEvent (new CustomEvent ("change:message"))
}
