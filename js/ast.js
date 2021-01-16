//@ts-check

export class AstELM
{
    // For all

    /** @type {string} */
    $
    /** @type {string} */
    name
    /** @type {string|null} */
    sdk

    // For CLS

    /** @type {string []|null} */
    base
    /** @type {AstTAG []} */
    doc
    /** @type {AstENU []} */
    enumerations
    /** @type {AstPRP []} */
    properties
    /** @type {AstFUN []} */
    statics
    /** @type {AstFUN []} */
    constructors
    /** @type {AstFUN []} */
    functions
    /** @type {AstFUN []} */
    signals

    // For RAW

    /** @type {string[]} */
    raw

    /**
     * @param {string} name 
     * @param {string []} base 
     */
    constructor ($, name, base)
    {
        this.$ = $
        this.name = name
        this.base = base ?? []
        this.sdk          = null
        this.doc          = []
        this.enumerations = []
        this.properties   = []
        this.statics      = []
        this.constructors = []
        this.functions    = []
        this.signals      = []
    }
}

export class AstENU
{
    $ = "ENU"
    /** @type {string} */
    name
    /** @type {AstTAG []}  */
    doc
    /** @type {AstVAL []}  */
    values

    /**
     * @param {string} name 
     */
    constructor (name)
    {
        this.name = name
        this.doc = []
        this.values = []
    }
}

export class AstVAL
{
    $ = "VAL"
    /** @type {string} */
    name
    /** @type {AstTAG[]}  */
    doc

    /**
     * @param {string} name 
     * @param {string} desc 
     */
    constructor (name, desc)
    {
        this.name = name
        this.doc = [new AstTAG ("summary", desc)]
    }
}

export class AstPRP
{
    $ = "PRP"
    /** @type {string} */
    name
    /** @type {string} */
    type
    /** @type {AstTAG[]}  */
    doc

    /**
     * @param {string} type 
     * @param {string} name 
     */
    constructor (type, name)
    {
        this.name = name
        this.type = type
        this.doc = []
    }
}

export class AstFUN
{
    /** @type {string} */
    $
    /** @type {string} */
    name
    /** @type {string} */
    type
    /** @type {AstTAG[]} */
    doc
    /** @type {AstARG[]} */
    args

    constructor ($, type, name, args)
    {
        this.$ = $
        this.name = name
        this.type = type
        this.doc = []
        this.args = args
    }
}

export class AstARG
{
    /** @type {string}  */
    name
    /** @type {string}  */
    type
    /** @type {string}  */
    default
    /** @type {AstTAG[]}  */
    doc

    /**
     * @param {string} type 
     * @param {string} name 
     * @param {string} def 
     */
    constructor (type, name, def)
    {
        this.name    = name
        this.type    = type
        this.default = def
        this.doc     = []
    }
}

export class AstTAG
{
    $ = "TAG"
    /** @type {string} */
    name
    /** @type {string[]} */
    lines

    /**
     * @param {string} name
     * @param {string} [text]
     */
    constructor (name, text)
    {
        this.name = name
        this.lines = text ? [text] : []
    }
}

export const AST_CLASSES = {
    ELM: AstELM,
    ENU: AstENU,
    VAL: AstVAL,
    PRP: AstPRP,
    FUN: AstFUN,
    ARG: AstARG,
    TAG: AstTAG
}

export class ApiParseResult
{
    /** @type {AstELM} */
    value = null
    mssage= ""
    error = false
}


/** @type {PEG.Parser} */
var _parser = null

export function init ()
{
    return fetch ("./peg/api.pegjs").then (r => r.text ()).then (gram =>
    {
        try
        {
            _parser = peg.generate (gram, {
                cache: false,
                optimize: "speed",
                output: "parser"
            });
            setMessage ("info", "Api parser built successfully")
        }
        catch (e)
        {
            _parser = null
            setMessage ("error", e.location == null
                ? e.message
                : `Line ${e.location.start.line}, column ${e.location.start.column}: ${e.message}`
            )
        }
        finally
        {
            return _parser != null;
        }
    })
}

/** @param {string} api */
export function parse (api)
{
    const r = new ApiParseResult ()
    try
    {
        r.value = _parser.parse (api, { startRule: "Main", AST: AST_CLASSES });
        console.assert (r.value instanceof AstELM)
        setMessage ("info", "Api parsed successfully")
        r.mssage = "Api parsed successfully"
    }
    catch (e)
    {
        r.error = true
        setMessage ("error",
            e.location == null
            ? e.message
            : `Line ${e.location.start.line}, column ${e.location.start.column}: ${e.message}`
        )
        r.mssage = e.location == null
            ? e.message
            : `Line ${e.location.start.line}, column ${e.location.start.column}: ${e.message}`
    }
    finally
    {
        return r
    }
}


/** @typedef {"change:message"} AstEvents */

/**
 * 
 * @param {AstEvents} event 
 * @param {(e: AstEvents) => void} func 
 */
export function on (event, func)
{
    //@ts-ignore
    document.addEventListener (event, e => func (event))
}



/** @type {{ level: "info"|"error", text: string }} */
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

