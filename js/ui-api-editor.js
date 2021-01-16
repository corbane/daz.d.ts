//@ts-check
/// <reference path="globals.d.ts" />

import * as Api from "./api.js"
import * as Sdk from "./sdk.js"
import * as ApiFormatter from "./cmd-api-formatter.js"
import * as SdkDiff from "./cmd-sdk-diff.js"

/**
 * @type {monaco.editor.IStandaloneCodeEditor}
 * @private
 */
var editor

/**
 * @type {Api.File}
 * @private
 */
var file

/** @private */
var uievents = true

/**
 * @param {HTMLElement} el 
 */
export function init (el)
{
    initApiLanguage ()

    document.getElementById ("bt-api-format").addEventListener ("click", () => runCommand ("format-doku"))
    document.getElementById ("bt-api-save").addEventListener ("click", () => runCommand ("save-api"))
    document.getElementById ("bt-api-fold").addEventListener ("click", () => runCommand ("fold-all"))

    editor = monaco.editor.create(el, {
        theme: "dazApiTheme",
        language: "dazApiLanguage",
        value: "",
        readOnly: true,
        automaticLayout: true,
        wordWrap: "on",
        wrappingIndent: "same",
        glyphMargin: true
    })

    editor.getModel ().onDidChangeContent (() =>
    {
        if (file == null) return
        file.setContent (getCode ())
        disableUiEvents ()
        useFile (file)
        enableUiEvents ()
    })
}

function initApiLanguage ()
{
    monaco.languages.register ({ id: "dazApiLanguage" })

    monaco.languages.setMonarchTokensProvider ("dazApiLanguage", {
        tokenizer: {
            root: [
                [/(?:UNK |GLO |NOT |CLS |ENU |PRP |STA |FUN |CTR |SIG )/, "dazapi-code"],
                [/ > .*/, "dazapi-tag"]
            ]
        }
    })
    
    monaco.editor.defineTheme ("dazApiTheme", {
        base: 'vs',
        inherit: true,
        colors: {},
        rules: [
            { token: "dazapi-code", foreground: "008800", fontStyle: "bold" },
            { token: "dazapi-tag", foreground: "0000FF"}
        ]
    })
}

function disableUiEvents ()
{
    uievents = false
}

function enableUiEvents ()
{
    uievents = true
}

/** @param {Api.File} f */
export function useFile (f)
{
    file = null // disable onDidChangeContent
    if (f == null) {
        setCode ("")
        editor.updateOptions ({ readOnly: true })
    }
    else {
        setCode (f.getContent () ?? `# Class ${f.name}\n${f.getUrl ()}\n\nCannot find the api file: ${f.name}`)
        editor.updateOptions ({ readOnly: false })
    }
    file = f
}

/** @typedef {"change:code"|"change:message"} ApiEditorStateEvents */

/**
 * 
 * @param {ApiEditorStateEvents} event 
 * @param {(e: ApiEditorStateEvents) => void} func 
 */
export function on (event, func)
{
    //@ts-ignore
    document.addEventListener (event, e => func (event))
}

function getCode ()
{
    return editor.getValue ()
}

/** @param {string} str  */
function setCode (str)
{
    editor.setValue (str)
    document.dispatchEvent (new CustomEvent ("change:code"))
}

/**
 * @type {{ level: "info"|"error", text: string}}
 * @private
 */
var message = { level: "info", text: "loading..." }

export function getMessage ()
{
    return message
}

/**
 * @param {"info"|"error"} level
 * @param {string} text
 */
function setMessage (level, text)
{
    message = { level, text }
    document.dispatchEvent (new CustomEvent ("change:message"))
}

/** @typedef {"format-doku"|"sdk-diff"|"fold-all"|"save-api"} ApiEditorCommands */

/**
 * 
 * @param {ApiEditorCommands} cmd 
 */
export function runCommand (cmd)
{
    switch (cmd)
    {
    case "format-doku" : cmdFormatDoku (); break
    case "sdk-diff"    : cmdSdkDiff (); break
    case "fold-all"    : editor.getAction ("editor.foldAll").run (); break
    case "save-api"    : cmdSaveApi (); break
    }
}

/**
 * @private
 */
function cmdFormatDoku ()
{
    const r = ApiFormatter.format (getCode ())
    if (r != null) setCode (r)
}


async function cmdSdkDiff ()
{
    const api = file
    if (api == null) return

    const sdk = await Sdk.get (api)
    if (sdk == null) return

    const diff = await SdkDiff.get (api, sdk)

    markSymbols (diff[0], "glyph-only-api")
    console.log (diff)
}

function cmdSaveApi ()
{
    if (file == null) return
    file.save ()
}

/**
 * @param {Record <string, string>} syms 
 * @param {string} cls 
 */
function markSymbols (syms, cls)
{
    const re_ctr_decl = /^CTR ([a-zA-Z_0-9]+)\(/
    const re_fun_decl = /^FUN [a-zA-Z_0-9:\.<>\[\]]+ : ([a-zA-Z_0-9]+)\(/


    /** @type {monaco.editor.IModelDeltaDecoration[]} */
    var decorations = []


    const lines = editor.getModel ().getLinesContent ()

    /**
     * 
     * @param {RegExp} re 
     * @param {string} n 
     */
    function findLine (re, n)
    {
        var i = 0
        for (var l of lines)
        {
            var m = l.match (re)
            if (m != null && m[1] == n)
                return i
            i++
        }
        return -1
    }

    for (var n in syms)
    {
        switch (syms[n])
        {
        case "CTR":
            var i = findLine (re_ctr_decl, n)
            if (i >= 0) decorations.push ({
                range: new monaco.Range (i+1, 1, i+1, 1),
                options: {
                    isWholeLine: true,
                    glyphMarginClassName: cls
                }
            })
            break
        case "FUN":
        case "SIG":
            var i = findLine (re_fun_decl, n)
            if (i >= 0) decorations.push ({
                range: new monaco.Range (i+1, 1, i+1, 1),
                options: {
                    isWholeLine: true,
                    glyphMarginClassName: cls
                }
            })
            break
        }
    }
    editor.deltaDecorations ([], decorations)
}