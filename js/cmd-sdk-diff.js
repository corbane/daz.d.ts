//@ts-check

/**
 * @param {import("./api.js").File} api 
 * @param {import("./sdk.js").SdkFile} sdk
 * @returns {Promise <[
 *  Record <string, string>, // only at left
 *  Record <string, string>, // at left and right
 *  Record <string, string>  // only at right
 * ]>}
 */
export async function get (api, sdk)
{
    const symsL = api.getSymbols ()
    const symsR = await sdk.getSymbols ()

    console.log (symsL, symsR)

    /** @type {Record <string, string>} */ var aL = {} // At Left
    /** @type {Record <string, string>} */ var aR = {} // At Right
    /** @type {Record <string, string>} */ var eq = {} // Equal

    for (var n in symsR)
    {
        if (n in symsL)
            eq[n] = symsR[n]
        else
            aR[n] = symsR[n]
    }

    for (var n in symsL)
    {
        if (n in eq || n in aR) continue
        aL[n] = symsL[n]
    }

    return [aL, eq, aR]
}
