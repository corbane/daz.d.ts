{
    var cobj = null
    var cdoc = null
    var m_section = null
    const H_DESCRIPTION  = "description"
    const H_ENUMERATIONS = "enumerations"
    const H_PROPERTIES   = "properties"
    const H_STATICS      = "statics"
    const H_CONSTRUCTORS = "constructors"
    const H_METHODS      = "methods"
    const H_SIGNALS      = "signals"

    var m_tag = null
    const TAG_SUMMARY    = "summary"
    const TAG_TODO       = "todo"
    const TAG_PARAMETERS = "parameters"
    const TAG_RETURNS    = "returns"
    const TAG_SINCE      = "since"
    const TAG_SEEALSO    = "seealso"
    const TAG_EXAMPLE    = "example"
    const BREAK = '\n'
    const IDENT_1  = ' '.repeat (2)
    const IDENT_2  = ' '.repeat (4)
    const IDENT_3  = ' '.repeat (6)
    const IDENT_4  = ' '.repeat (8)

    const HEAD    = "### "
    const MINUS   = "- "
    const ASTERISK = "* "
    const QUOTE    = "> "
    const PLUS     = "+ "

    const file = {
        name: null,
        base: null,
        description : [],
        enumerations: [],
        properties  : [],
        statics     : [],
        constructors: [],
        methods     : [],
        signals     : [],
    }

    function remove_null (lst)
    {
        const r = []
        for (const l of lst)
            if (l != null) r.push (l)
        return r
    }
}

File = 
    h:Head WL*
    u:Url? WL*
    l:Line*
    {
        return h
            + (u ? "\n" + u : "")
            + remove_null (l).join ("\n")
    }

_    "whitespace"   = [ \t]*
NL   "new_line"     = [\n\r]+
WL   "white_line"   = [ \t]* NL
ROL  "rest_of_line" = [^\n\r]*   { return text () }

NAME "NAME" = [a-zA-Z_][a-zA-Z_0-9]*    { return text () }
TYPE "TYPE" = [a-zA-Z_][a-zA-Z_0-9\.]*  { return text () }

Head
    = "#"_  "class"i _ n:NAME _ b:Base? NL
    {
        return b ? `CLS ${n} : ${b}` : `CLS ${n}`
    }
Base
    = ":"_ a:NAME b:( _ n:NAME { return n } )*
    {
        return [a, ...b].join (" ")
    }
Url
    = "http://" h:ROL NL
    {
        return IDENT_1 + QUOTE + "online\n"
             + IDENT_2 + "http://" + h + "\n"
    }

Line
    = "—–" NL
    {
        return null
    }
    / s:Section NL
    {
        m_section = s
        m_tag     = null
        cobj      = file[s]
        return BREAK + HEAD + s
    }
    / s:DocTags NL
    {
        if (s == null) return null // tag "Signature:"
        m_tag = s
        return IDENT_1 + QUOTE + s
    }
    / s:Field NL
    {
        return m_tag == TAG_PARAMETERS
          ? IDENT_2 + PLUS + s
          : IDENT_1 + PLUS + s
    }
    / s:Decl NL
    {
        m_tag = null
        return BREAK + s
    }
    / s:ROL NL
    {
        if (m_tag == null) {
            m_tag = TAG_SUMMARY
            return IDENT_1 + QUOTE + TAG_SUMMARY + "\n"
                 + IDENT_2 + s
        }
        return IDENT_2 + s
    }

Section
    = "Detailed Description"    { return H_DESCRIPTION  }
    / "Enumerations"            { return H_ENUMERATIONS }
    / "Properties"              { return H_PROPERTIES   }
    / "Static Methods"          { return H_STATICS      }
    / "Constructors"            { return H_CONSTRUCTORS }
    / "Methods"                 { return H_METHODS      }
    / "Signals"                 { return H_SIGNALS      }

Decl
    = ": " s:ROL  // Enumeration
      { return "ENU " + s }
    / &{ return m_section == H_CONSTRUCTORS } NAME "(" ROL // Constructor (only in "Constructors" section)
      { return "CTR " + text () }
    / TYPE " : " NAME "(" ROL // Static method, Method or Signal
      { return (m_section == H_STATICS ? "STA " : m_section == H_SIGNALS ? "SIG " : "FUN ") + text () }
    / TYPE " : " NAME ROL // property
      { return "PRP " + text () }

// Enumeration value OR parameter documentation
Field
    = NAME " - " ROL    { return text () }

DocTags
    = "Todo:"           { return TAG_TODO       }
    / "Parameter(s):"   { return TAG_PARAMETERS }
    / "Return Value:"   { return TAG_RETURNS    }
    / "Since:"          { return TAG_SINCE      }
    / "See Also:"       { return TAG_SEEALSO    }
    / "Example:"        { return TAG_EXAMPLE    }
    / "Attention:" ROL  { return "attention"  }
    / "Signature:" ROL  { return null  }
    // / "Array Access:"   { return ""    }
    