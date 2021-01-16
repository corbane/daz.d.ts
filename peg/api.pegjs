{
    const AST = options.AST

    var csection = "" // eg. name after "### " code
    var ccode    = ""
    
    /** @type {AstClass} */
    var cclass = null

    /** @type {AstClass|AstEnum|AstProperty|AstFunction} */
    var cobj = null

    /** @type {AstTag} */
    var ctag = null

    var carg = null
}

Main = File

_ "whitespace" = [ \t]+
NL   = [\n\r]+
NUM  = [+-]? [0-9]+ ('.' [0-9])?
ROL  = [^\n\r]* { return text () }

NAME   = ([a-zA-Z_][a-zA-Z_0-9]*/"…")     { return text () }
TYPE   = [a-zA-Z_][a-zA-Z_0-9\.]*   ("[" [^\]]* "]"/"<" [^>]+ ">")? ("|" TYPE)*  { return text () }
NAME_T = [a-zA-Z_][a-zA-Z_0-9]* ("<" [^>]+ ">")?   { return text () }
NAME_O = [a-zA-Z_][a-zA-Z_0-9]* "?"?     { return text () }

File
    = "RAW " NL a:( l:ROL NL {return l} )* b:ROL?
    {
        cclass = new AST.ELM ("RAW", null, null)
        if (b) a.push (b)
        cclass.raw = a
        return cclass
    }
    / "NOT " .*
    {
        return new AST.ELM ("NOT", null, null)
    }
    / Head Line* { return cclass }
    
Head
    = "UNK " n:NAME
    {
        csection = ""
        ccode = "UNK"
        cobj = cclass = new AST.ELM (ccode, n, null)
    }
    / "GLO " n:NAME
    {
        csection = ""
        ccode = "GLO"
        cobj = cclass = new AST.ELM (ccode, n, null)
    }
    / "CLS " n:NAME_T b:Base?
    {
        csection = ""
        ccode = "CLS"
        cobj = cclass = new AST.ELM (ccode, n, b)
    }

Base
    = " : " a:NAME b:( " " v:NAME {return v} )*
    {
        return [a, ...b]
    }

Line
    = "ENU " n:NAME
    {
        ccode = "ENU"
        cobj = new AST.ENU (n)
        cclass.enumerations.push (cobj)
    }
    / "  + " n:NAME " - " d:ROL
    {
        cobj.values.push (new AST.VAL (n, d))
    }
    / "PRP " t:TYPE " : " n:NAME
    {
        ccode = "PRP"
        cobj = new AST.PRP (t, n)
        cclass.properties.push (cobj)
    }
    / "CTR " n:NAME_T a:Arg_List
    {
        ccode = "CTR"
        cobj = new AST.FUN ("CTR", n, n, a)
        cclass.constructors.push (cobj)
    }
    / "STA " t:TYPE " : " n:NAME a:Arg_List
    {
        ccode = "STA"
        cobj = new AST.FUN ("STA", t, n, a)
        cclass.statics.push (cobj)
    }
    / "FUN " t:TYPE " : " n:NAME_T a:Arg_List
    {
        ccode = "FUN"
        cobj = new AST.FUN ("FUN", t, n, a)
        cclass.functions.push (cobj)
    }
    / "SIG void : " n:NAME a:Arg_List
    {
        ccode = "SIG"
        cobj = new AST.FUN ("SIG", "void", n, a)
        cclass.signals.push (cobj)
    }
    / &{ return csection == "description" }
      "  > " n:NAME
    {
        ctag = new AST.TAG (n)
        if (n == "summary") ctag.name = "remarks"
        cobj.doc.push (ctag)
    }
    / "  > " n:NAME
    {
        ctag = new AST.TAG (n)
        if (n != "parameters") cobj.doc.push (ctag)
    }
    / &{ return ctag != null && ctag.name == "parameters" }
      "    + " n:(NAME/"…") " - " d:ROL
    {
        switch (cobj.$)
        {
        case "STA" : var cfun = cclass.statics      [cclass.statics.length-1]      ; break
        case "CTR" : var cfun = cclass.constructors [cclass.constructors.length-1] ; break
        case "FUN" : var cfun = cclass.functions    [cclass.functions.length-1]    ; break
        case "SIG" : var cfun = cclass.signals      [cclass.signals.length-1]      ; break
        }
        carg = null
        for (carg of cfun.args) {
            if (carg.name == n) break
        }
        carg.doc.push (new AST.TAG ("summary", d))
    }
    / &{ return ctag != null && ctag.name == "parameters" }
      "      " d:ROL 
    {
        carg.doc[0].lines.push (d)
    }
    / "    " s:ROL
    {
        if (ctag.name == "parameters") 
            error ("Global parameters description not implemented")
        else
            ctag.lines.push (s)
    }
    / "### " n:NAME
    {
        csection = n
        ccode = ""
        ctag = null
    }
    / "NOT " ROL (NL &"    " ROL)*  { return null }
    / "!!! " ROL (NL &"    " ROL)*  { return null }
    / NL

Arg_List
    = "()"                                              { return [] }
    / "( " a:Arg b:( ', ' r:Arg { return r } )* " )"    { return [a, ...b] }

Arg
    = "…"
    {
        return {
            $      : "argument",
            name   : "…",
            type   : "any[]",
            default: null,
            doc    : []
        }
    }
    / t:TYPE " …"
    {
        return {
            $      : "argument",
            name   : "…",
            type   : t,
            default: null,
            doc    : []
        }
    }
    / t:TYPE " " n:NAME_O o:("=" Opt)?
    {
        return {
            $      : "argument",
            name   : n,
            type   : t,
            default: o ? o[1]: null,
            doc    : []
        }
    }

Opt
    = '"' [^"]* '"'         { return text () }
    / '“' [^”]* '”'         { return text () }
    / '[' [^\]]* ']'        { return text () }
    / [a-zA-Z_0-9\.\+\-]* ("|" [a-zA-Z_0-9\.\+\-]*)*   { return text () } // eg: length-1