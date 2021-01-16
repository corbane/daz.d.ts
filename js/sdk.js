//@ts-check
/// <reference path="globals.d.ts" />

import * as Api from "./api.js"
import { AstENU, AstFUN, AstPRP, AST_CLASSES } from "./ast.js"

const SDK_PATH = "./sdk/"

/**
 * @type {PEG.Parser}
 */
var _parser = null

/** @type SdkFile[] */
var _files = []

export class SdkFile
{
    /**
     * Api name
     * @type {string}
     */
    name

    /**
     * Path of the SDK header file
     * @type {string}
     */
    path

    /**
     * Content of the SDK header file
     * @type {string}
     * @private
     */
    content

    /**
     * @type {SdkAst}
     * @private
     */
    ast

    /**
     * @param {string} name
     */
    constructor (name)
    {
        this.name = name
        this.path = getPath (name)
    }

    async getContent ()
    {
        return this.content == null
             ? this.content = await fetchFile (this.path)
             : this.content
    }

    async getSymbols ()
    {
        if (this.ast == null)
            this.ast = getAst (await this.getContent ())

        return this.ast == null
             ? null
             : this.ast.SYMS
    }
}

export function init ()
{
    return fetch ("./peg/sdk.pegjs").then (r => r.text ()).then (gram => 
    {
        try
        {
            _parser = peg.generate (gram, {
                cache: false,
                optimize: "speed",
                output: "parser"
            });
            setMessage ("info", "Build SDK parser OK")
        }
        catch (e)
        {
            _parser = null
            setMessage ("error",
                e.location == null
                ? e.message
                : "Build SDK parser ERROR - "
                + `Line ${e.location.start.line}, column ${e.location.start.column}: ${e.message}`
            )
        }
        finally
        {
            return _parser != null
        }
    })
}

/**
 * Take an api name (eg. "DzApp") end return the SDK header path (eg. "dzapp.h")
 * @param {string} name 
 */
function getPath (name)
{
    name = name.startsWith ("Dz") ? "dz" + name.substr (2).toLowerCase ()
         : name.startsWith ("dz") ? name
         : name.endsWith  ("_dz") ? "dz" + name.substr (0, name.length - 3)
         : null
    return SDK_PATH + name + ".h"
}

/**
 * @param {Api.File} file 
 */
export async function get (file)
{
    var idx = file.getIndex ()
    return _files[idx] == null
        ? _files[idx] = new SdkFile (file.name)
        : _files[idx]
}

function fetchFile (path)
{
    return fetch (path).then (rep =>
    {
        if (rep.ok) return rep.text ()
        setMessage ("error", "Cannot get " + path)
        return null
    })
}

/**
 * @typedef {{
 *  SYMS: Record <string, string>,
 *  ENUS: AstENU[],
 *  PRPS: AstPRP[],
 *  CTRS: AstFUN[],
 *  FUNS: AstFUN[],
 * }} SdkAst
 */

/**
 * @param {string} content 
 * @returns {SdkAst}
 */
function getAst (content)
{
    try
    {
        var ast = _parser.parse (content, { startRule: "Main", AST: AST_CLASSES })
        setMessage ("info", "SDK parsing OK")
        return ast
    }
    catch (e)
    {
        setMessage ("error",
            e.location == null
            ? e.message
            : "SDK parsing ERROR - "
            + `Line ${e.location.start.line}, column ${e.location.start.column}: ${e.message}`
        )
        return null
    }
}


/** @typedef {"change:message"} SdkEvents */

/**
 * @param {SdkEvents} event 
 * @param {(e) => void} func 
 */
export function on (event, func)
{
    document.addEventListener (event, e => func (event))
}


/**
 * @type {{ level: "info"|"error", text: string }}
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
export function setMessage (level, text)
{
    _message = { level, text }
    document.dispatchEvent (new CustomEvent ("change:message"))
}

