{
    const AST = options.AST
    const ENUS = []
    const PRPS = []
    const CTRS = []
    const FUNS = []
}

Main = File

_ "whitespace" = [ \t]*
NL   = [\n\r]+
ROL  = [^\n\r]*                 { return text () }
NAME = [a-zA-Z_][a-zA-Z_0-9]*   { return text () }
TYPE = ([ \t]/"virtual"/"enum"/"struct"/"const"/"static")* NAME ("::" NAME)* (_"const")? (_ [&*]+)?   { return text () }

File 
	= a:Line b:( NL l:Line {return l} )*
    {
        var SYMS = {}
        for (var e of ENUS) SYMS[e.name] = e.$
        for (var e of PRPS) SYMS[e.name] = e.$
        for (var e of CTRS) SYMS[e.name] = e.$
        for (var e of FUNS) SYMS[e.name] = e.$
        return {
            SYMS,
            ENUS,
            PRPS,
            CTRS,
            FUNS
        }
    }
    
Line
    = _"enum" _ n:NAME _ "{" ROL
    {
        ENUS.push (new AST.ELM ("ENU", n, null))
    }
    / _"Q_PROPERTY" _ "(" _ t:TYPE _ n:NAME ROL
    {
        PRPS.push (new AST.PRP (t, n))
    }
    //  / _ n:NAME _ "(" a:[^)\n\r]* ")" [^;\n\r]* ";" ROL
    / _ n:NAME _ "(" _ a:Arg_List? _ ")" [^;\n\r]* ";" ROL
    {
        CTRS.push (new AST.FUN ("CTR", n, n, a ?? [])) // bad type for a
    }
    //  / _ t:TYPE _ n:NAME _ "(" a:[^)\n\r]* ")" ROL
    / _ t:TYPE _ n:NAME _ "(" _ a:Arg_List? _ ")" ROL
    {
        FUNS.push (new AST.FUN ("FUN", t, n, a ?? [])) // bad type for a
    }
    / ROL { return null }

Arg_List
    = a:Arg _ b:("," _ Arg _)*
    {
        b.push (a)
        return b
    }

Arg
    = t:TYPE _ n:NAME _ Def?
    {
        return new AST.ARG (t, n, null)
    }

Def
    = "=" _ [^,)]+