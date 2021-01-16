//@ts-check

import * as Ast from "./ast.js"

const DSA = `
function getInstanceFields (obj)
{
    const names = Object.getOwnPropertyNames (obj)
    for (var i = 0 ; i < names.length ; i++)
    {
        var n = names[i]
        var p = Object.getOwnPropertyDescriptor (obj, n)
        var t = typeof obj[n]

        if (t == "function")
        {
            print (t, n)
            for (var k in p) {
                if (k != "value") print ("  " + k + ": " + p[k])
            }
        }
        else
        {
            print (t, n, p.value)
            for (var k in p) {
                if (k != "get" && k != "set") print ("  ", k, p[k])
            }
        }
    }
}
`

/**
 * @param {Record <string, string[]>} left // { name: [$, ...], ... }
 * @param {Record <string, string[]>} right // { name: [$, ...], ... }
 */
function compare (left, right)
{
    /** @type {Record <string, unknown>} */
    var aL = {}

    /** @type {Record <string, [unknown, unknown]>} */
    var eq = {}

    for (var n in left)
    {
        if (n in right) {
            eq[n] = [left[n], right[n]]
            delete right[n]
        }
        else {
            aL[n] = left
        }
    }

    return { aL, eq, aR: right }
}

/**
 * @param {string} obj 
 */
function getDescriptors (obj)
{
    const names = Object.getOwnPropertyNames (obj)
    /** @type {Record <string, PropertyDescriptor>} */
    const descs = {}
    for (var i = 0 ; i < names.length ; i++) {
        descs[names[i]] = Object.getOwnPropertyDescriptor (obj, names[i])
    }
    return descs
}

/**
 * @param {string} type 
 */
function qscriptType (type)
{
    switch (type)
    {
    case "boolean" : return "Boolean"
    case "number"  : return "Number"
    case "string"  : return "String"
    case "function": return "Function"
    default: return type
    }
}

/**
 * @param {Ast.AstELM} ast 
 */
export function testELM (ast, obj)
{
    const descs = getDescriptors (obj)

    const prps = ast.properties
    for (var i = 0 ; i < prps.length ; i++)
    {
        var prp = prps[i]
        if (prp.name in descs) {
            testPRP (prp, descs[prp.name])
            delete descs[prp.name]
        }
        else {
            print ("++ PRP ", prp.name)
        }
    }

    const enus = ast.enumerations
    for (var i = 0 ; i < enus.length ; i++)
    {
        var enu = enus[i]
        for (var i = 0 ; i < enu.values.length ; i++)
        {
            var v = enu.values[i]
            if (v.name in enu) {
                testVAL (v, descs[v.name])
                delete descs[v.name]
                
            }
            else {
                print ("++ ENU ", enu.name)
            }
        }
        for ()
    }

    for (var n in obj)
    {
        var t = typeof obj[n]
        if (t == "function") {
            print ("-- FUN ", n)
        }
        else {
            print ("-- PRP ", n)
        }
    }
}

/**
 * @param {Ast.AstPRP} prp 
 * @param {PropertyDescriptor} d 
 */
function testPRP (prp, d)
{
    if (
        prp.type != qscriptType (typeof d.value)
        || d.set == null
        || d.writable == false
    ) {
        print ("~~ PRP ", prp.name)
    }
    else {
        print ("== PRP ", prp.name)
    }
}

/**
 * @param {Ast.AstVAL} val 
 * @param {PropertyDescriptor} d 
 */
function testVAL (val, d)
{
    if ("number" != qscriptType (typeof d.value)) {
        print ("~~ VAL ", val.name)
    }
    else {
        print ("== VAL ", val.name)
    }
}

/**
 * @param {Ast.AstPRP} prp 
 */
function generatePRP (prp)
{

}