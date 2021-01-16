//@ts-check

import {
    parse as parseApi,
    AstARG,
    AstELM,
    AstENU,
    AstFUN,
    AstPRP,
    AstTAG,
    AstVAL
} from "./ast.js"
import * as Api from "./api.js"


export const DOC = `
## Tsd generator

### Notes

Dans la documentation de Daz
- Le groupe « Static Methods » ne définis pas des méthodes statiques mais des fonctions d'instances
- Les énumérations sont indicatifs et les valeurs sont aplatis dans les types et leurs instances d'objets
  par exemple: \`DzDir.AccessMask === new DzDir ("").AccessMask\`
- Je m'interroge sur les surcharges de fonctions ou des signaux dans les classes dérivés
  Est-ce vraiment des surcharges ou la classe dérivé remplace t'elle complétement les fonctions/signaux ?
`


/** @param {Api.File[]} apifiles  */
export function generateAll (apifiles)
{
    if (Array.isArray (apifiles) == false)
        return

    var s= "/// <reference no-default-lib=\"true\"/>\n"
        +  "/// <reference lib=\"es2015\" />\n"
        + genUNK ("Communication")
        + genUNK ("cameracube_dz")
        + genUNK ("renderview_dz")
        + genUNK ("contenttab_dz")
        + genUNK ("propertysidenavhierarchy_dz")
        + genUNK ("elementclipboard_dz")
        + genUNK ("pbuffer_dz")
        + genUNK ("wsmodifier_dz")
        + genUNK ("iprrenderhandler_dz")
        + genUNK ("propertyclipboard_dz")
        + genUNK ("Permissions ")
        + genUNK ("defaultbrickuser_dz")
        + genUNK ("shaderbrick_dz")
        + genUNK ("brickset_dz")
        + genUNK ("QVariant")
        + genUNK ("naturalspline_dz")
        + genUNK ("facetmesh_dz")
        + genUNK ("sceneshader_dz")
        + genUNK ("panegroupdlg_dz")
        + genUNK ("dformmodifier_dz")
        + genUNK ("vertexmesh_dz")
        + genUNK ("vertexmap_dz")
        + genUNK ("geometryregion_dz")

        // + genUNK ("geometry_dz")
        // + genUNK ("morph_dz")

        //+ Undefined ("shape_dz")
        //+ Undefined ("figure_dz")
        // + Undefined ("")
        // + Undefined ("")

    s +="\ntype Signal<F> = F & {"
        + "\n  connect (thisArg: QObject, func: Function): void,"
        + "\n  disconnect (func: Function): void,"
        + "\n}"
        
    for (var f of apifiles)
    {
        const c = f.getContent ()
        if (c == null)
        {
            s += genUNK (f.name)
            continue
        }
        
        const ast = parseApi (c)
        s += ast.error
            ? `\n// ${f.name} API error: ${ast.mssage}`
            : generate (ast.value)
    }
    return s
}

/** @param {AstELM} ast  */
export function generate (ast)
{
    switch (ast.$)
    {
    case "NOT": return ""
    case "RAW": return "\n" + ast.raw.join ("\n")
    case "UNK": return generateUNK (ast)
    case "GLO": return generateGLO (ast)
    case "CLS": return genInterface (ast)
    }
    throw `// UNKNOWN node $ ${ast.$}`
}

/**
 * @todo remove
 * @param {string} name 
 */
function genUNK (name)
{
    return `\n/* Unknown API */ declare type ${name} = any;`
}

/** @param {AstELM} ast  */
export function generateUNK (ast)
{
    return "\n"
            + `\ndeclare var ${ast.name}: unknown`
            + `\ntype ${ast.name} = typeof ${ast.name}`
}

/** @param {AstELM} ast  */
export function generateGLO (ast)
{
    const I1 = "  "
    return [
        "",
        ...ast.properties.map (prp =>
        (
            genTAGList (prp.doc, I1)
            + `\ndeclare var ${prp.name}: ${getType (prp.type)}`
        )),
        ...ast.functions.map (fun =>
        (
            genFunDoc (fun, I1)
            + `\ndeclare function ${fun.name} (${genARGList (fun.args)}): ${getType (fun.type)};`
        ))
    ]
    .join ("\n")
}

/** @param {AstELM} ast */
export function generateCLS (ast)
{
    const NL = "\n"
    const I1 = "  "
    const NL_ = NL + I1

    var r = [
        "",
        genTAGList (ast.doc, ""),
        `declare class ${ast.name}`,
        (ast.base.length > 0 ? ` extends ${ast.base[0]}` : ""),
        (ast.base.length > 1 ? ` implements ${ast.base.slice (1).join (", ")}` : "" ), // DzRefCountedItem
        "{",
        ...ast.constructors.map (fun =>
        (
            genFunDoc (fun, I1)
            + `\n  constructor (${genARGList (fun.args)});`
        )),
        ...ast.enumerations.map (enu =>
        {   
            return genTAGList (enu.doc, I1)
                +  enu.values.map (v =>
                (
                    genTAGList (v.doc, I1)
                    + `\n  readonly ${v.name}: number;`
                ))
                .join ("\n")
        }),
        ...ast.properties.map (prp =>
        (
            genTAGList (prp.doc, I1)
            + `\n  ${prp.name}: ${getType (prp.type)}`
        )),
        ...ast.statics.map (fun =>
        (
            genFunDoc (fun, I1)
            + `\n  ${fun.name} (${genARGList (fun.args)}): ${getType (fun.type)};`
        )),
        ...ast.functions.map (fun =>
        (
            genFunDoc (fun, I1)
            + `\n  ${fun.name} (${genARGList (fun.args)}): ${getType (fun.type)};`
        )),
        genSignals (ast.signals, I1),
        // ...ast.signals.map (fun =>
        // (
        //     genFunDoc (fun, I2)
        //     + `${fun.name} : Signal<(${genArgs (fun.args)}) => void>;`
        // ))
        "}"
    ]
    .join ("\n")
        
    if (ast.enumerations.length == 0)
        return r

    return r + [
        "", 
        `declare namespace ${ast.name}`,
        "{",
        ...ast.enumerations.map (enu =>
        {   
            return genTAGList (enu.doc, I1)
                +  map (enu.values, v => {
                        return genTAGList (v.doc, I1)
                            + NL_+ `const ${v.name}: number;`
                    })
        }),
        "}"
    ]
    .join ("\n")
}

/** @param {AstELM} elm */
export function genInterface (elm)
{
    const I1 = "  "

    return [
        "",
        genTAGList (elm.doc, ""),
        `interface ${elm.name}` + (elm.base.length > 0 ? ` extends ${elm.base.join (", ")}` : "" ),
        "{",
        ...elm.enumerations.map (enu =>
        {   
            return genTAGList (enu.doc, I1)
                +  enu.values.map (v =>
                (
                    genTAGList (v.doc, I1)
                    + `\n  readonly ${v.name}: number;`
                ))
                .join ("\n")
        }),
        ...elm.properties.map (prp =>
        (
            genTAGList (prp.doc, I1)
            + `\n  ${prp.name}: ${getType (prp.type)}`
        )),
        ...elm.statics.map (fun => 
        (
            genFunDoc (fun, I1)
            + `\n  ${fun.name} (${genARGList (fun.args)}): ${getType (fun.type)};`
        )),
        ...elm.functions.map (fun =>
        (
            genFunDoc (fun, I1)
            + `\n  ${fun.name} (${genARGList (fun.args)}): ${getType (fun.type)};`
        )),
        genSignals (elm.signals, I1),
        "}",
        ( elm.constructors.length == 0
            ? genNamespace (elm, true)
            : genVarClass (elm)
        )
    ]
    .join ("\n")
}

/** @param {AstELM} elm */
function genVarClass (elm)
{
    if (elm.constructors.length == 0 && elm.enumerations.length == 0)
        return ""

    const I1 = "  "

    return [
        "" ,
        `declare var ${elm.name}:`,
        "{",
        `  prototype: ${elm.name};`,
        ...elm.constructors.map (fun =>
        (
            genFunDoc (fun, I1)
            + `\n  new (${genARGList (fun.args)}): ${elm.name};`
        )),
        ...elm.enumerations.map (enu =>
        (
            genTAGList (enu.doc, I1)
            + map (enu.values, v =>
            {
                return genTAGList (v.doc, I1)
                + `\n  readonly ${v.name}: number;`
            })
        )),
        "}"
    ]
    .join ("\n")
}

/**
 * @param {AstELM} elm
 * @param {boolean} includeStaticMethod
 */
function genNamespace (elm, includeStaticMethod)
{
    if (elm.enumerations.length == 0 && includeStaticMethod && elm.statics.length == 0)
        return ""

    const I1 = "  "

    return [
        "" ,
        `declare namespace ${elm.name}`,
        "{",
        ...elm.enumerations.map (enu =>
        {   
            return genTAGList (enu.doc, I1)
            + map (enu.values, v =>
            {
                return genTAGList (v.doc, I1)
                + `\n  export const ${v.name}: number;`
            })
        }),
        ...(includeStaticMethod == false 
            ? []
            : elm.statics.map (fun =>
            {
                return genFunDoc (fun, I1)
                + `\n  export function ${fun.name} (${genARGList (fun.args)}): ${getType (fun.type)};`
            })
        ),
        "}"
    ]
    .join ("\n")
}

/**
 * @param {string} name 
 */
function getName (name)
{
    switch (name)
    {
    case "shape_dz": return "DzShape"
    case "figure_dz": return "DzFigure"
    }
}

/**
 * @param {string} type 
 */
function getType (type)
{
    switch (type)
    {
    case "Boolean" : return "boolean"
    case "Number"  : return "number"
    case "String"  : return "string"
    case "Array"   : return "Array<unknown>"
    default: return type.indexOf ('.') < 0 ? type : "number"
    }
}

/**
 * @param {AstFUN[]} funcs
 * @param {string} ident 
 */
function genSignals (funcs, ident)
{
    /** @type {Record<string, AstFUN[]>} */
    var signals = {}
    for (var f of funcs)
    {
        if (f.name in signals)
            signals[f.name].push (f)
        else
            signals[f.name] = [f]
    }

    const NL = "\n" + ident
    const I2 = ident + ident
    var s = ""
    for (var n in signals)
    {
        s +=NL + n + ": Signal<{"
            + map (signals[n], f =>
            (
                genFunDoc (f, I2)
                + `\n  (${genARGList (f.args)}): void;`
            ))
            + NL + "}>;"
    }
    return s
}

/**
 * @param {AstARG []} args 
 */
function genARGList (args)
{
    return args.map (
        a => a.default
            ? `${a.name}?: ${getType (a.type)}`
            : `${a.name == "…" ? "..._" : a.name}: ${getType (a.type)}`
    )
    .join (", ")
}

/**
 * @param {AstTAG []} tags 
 * @param {string} ident 
 */
function genTAGList (tags, ident)
{
    return [
        `\n${ident}/**`,
        ...tags.map (tag =>
        (
            genTAG (tag, ident) 
        )),
        ident + " */"
    ]
    .join ("\n")
}

/**
 * Special version of genTAGList for functions
 * @param {AstFUN} fun 
 * @param {string} ident 
 */
function genFunDoc (fun, ident)
{
    const NL = `${ident} *         `
    var d
    return [
        `\n${ident}/**`,
        ...fun.doc.map (tag =>
        (
            genTAG (tag, ident) 
        )),
        ...fun.args.map (arg =>
        { 
            d = (arg.doc.length > 0 && arg.doc[0].name == "summary")
                ? arg.doc[0].lines.join (NL)
                : ""
            return arg.default
                ? `${ident} * @param [${arg.name}=${arg.default}] - ${d}`
                : `${ident} * @param ${arg.name == "…" ? "_" : arg.name} - ${d}`
        }),
        `${ident} */`
    ]
    .join ("\n")
}

/**
 * @param {AstTAG} tag
 * @param {string} ident 
 */
function genTAG (tag, ident)
{
    const NL = `\n${ident} * `
    switch (tag.name)
    {
    case "summary" : return ident + " * " + tag.lines.join (NL)
    case "online"  : return `${ident} * @see ${tag.lines[0]}`
    case "example" : return `${ident} * @example${NL}` + tag.lines.join (NL)
    default        : return `${ident} * @${tag.name} ${tag.lines.join (NL)}` 
    }
}

/**
 * @template T
 * @param {T[]} arr 
 * @param {(v: T) => string} fn 
 * @param {string} sep
 * @private
 */
function map (arr, fn, sep="")
{
    return arr.map (fn).join (sep)
}
