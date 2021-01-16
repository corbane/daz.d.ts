//@ts-check
/// <reference path="globals.d.ts" />

/** @type {PEG.Parser} */
var _parser = null

export const DOC = `
# Api formater

L’objet ApiFormater est une commande utilitaire permettant de transformer du texte copier depuis une page de la documentation de l'API de Daz en un format valide pour l'analyseur.

## Syntaxe

La syntaxe d'entrée doit correspondre à:
    # class <NAME_OF_CLASS> [: NAME_OF_BASE_CLASS ...]
    http://<URL_OF_DAZ_DOCUMENTATION>
    SHORT_DESCRIPTION
    CONTENT_OF_DAZ_PAGE
    \\n

SHORT_DESCRIPTION
   est inscrit sur la page Daz directement sous le nom de la classe.
CONTENT_OF_DAZ_PAGE
   est un simple copier-coller englobent la section "Detailed Description" jusqu'à la fin de la page.
   
Le text doit toujours finir par une ligne blanche

    Par exemple pour la class DzLCDNumber, la page de documentation Daz est http://docs.daz3d.com/doku.php/public/software/dazstudio/4/referenceguide/scripting/api_reference/object_index/lcdnumber_dz et le text peut être:
    # class DzLCDNumber : DzWidget
    http://docs.daz3d.com/doku.php/public/software/dazstudio/4/referenceguide/scripting/api_reference/object_index/lcdnumber_dz
    DAZScript wrapper for QLCDNumber.

    Detailed Description
    A DzLCDNumber provides a LCD-style number display.

    The following digits and symbols can be displayed:

    0/O, 1, 2, 3, 4, 5/S, 6, 7, 8, 9/g, - (minus), . (decimal point), A, B, C, D, E, F, h, H, L, o, P, r, u, U, Y, : (colon), &deg; (degree sign - which is specified as single quote in the string) and space.

    Illegal characters are substituted with spaces.

    Enumerations
    : Mode

    Enumerated mode (number base) types.

    Hex - Hexadecimal (base 16)
    Dec - Decimal (base 10)
    Oct - Octal (base 8)
    Bin - Binary (base 2)
    HEX - Same as Hex
    DEC - Same as Dec
    OCT - Same as Oct
    BIN - Same as Bin
    —–

    ...

    Signals
    void : overflow()

    Signature:“overflow()”

    Emitted when the number is set to a value that exceeds the number of digits.
`

export function init ()
{
    return fetch("./peg/format.pegjs")
        .then(r => r.text())
        .then(gram =>
        {
            try
            {
                _parser = peg.generate (gram, {
                    cache: false,
                    optimize: "speed",
                    output: "parser"
                });
                setMessage ("info", "Build Api formatter OK")
            }
            catch (e)
            {
                _parser = null
                setMessage ("error",
                    e.location == null
                    ? e.message
                    : "Build Api formatter ERROR - "
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
 * @param {string} txt
 */
export function format (txt)
{
    /** @type {string} */
    var r
    try
    {
        r = _parser.parse (txt)
        setMessage ("info", "Api formatting OK")
    }
    catch (e)
    {
        r = null
        setMessage ("error",
            e.location == null
            ? e.message
            : "Api formatting ERROR - "
            + `Line ${e.location.start.line}, column ${e.location.start.column}: ${e.message}`
        )
    }
    finally
    {
        return r;
    }
}


// State


/** @typedef {"change:message"} ApiFormaterEvents */

/**
 * 
 * @param {ApiFormaterEvents} event 
 * @param {(e: ApiFormaterEvents) => void} func 
 */
export function on (event, func)
{
    //@ts-ignore
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

