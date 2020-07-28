export const ILLEGAL = "ILLEGAL";
export const EOF = "EOF";

// Identifiers + literals
export const IDENT = "IDENT";
export const INT = "INT";
export const STRING = "STRING";

// Operators
export const ASSIGN = "=";
export const PLUS = "+";
export const MINUS = "-";
export const BANG = "!";
export const ASTERISK = "*";
export const SLASH = "/";

export const LT = "<";
export const GT = ">";

export const EQ = "==";
export const NOT_EQ = "!=";

// Delimiters
export const COMMA = ",";
export const SEMICOLON = ";";
export const COLON = ":";

export const LPAREN = "(";
export const RPAREN = ")";
export const LBRACE = "{";
export const RBRACE = "}";
export const LBRACKET = "[";
export const RBRACKET = "]";

// Keywords
export const FUNCTION = "FUNCTION";
export const LET = "LET";
export const TRUE = "TRUE";
export const FALSE = "FALSE";
export const IF = "IF";
export const ELSE = "ELSE";
export const RETURN = "RETURN";

export type TokenType = string;

export type Token = {
  Type: TokenType;
  Literal: string;
};

const keywords: { [key: string]: TokenType } = {
  "fn": FUNCTION,
  "let": LET,
  "true": TRUE,
  "false": FALSE,
  "if": IF,
  "else": ELSE,
  "return": RETURN,
};

export const lookupIdent = (ident: string): TokenType => {
  const tok = keywords[ident];

  if (tok) {
    return tok;
  }

  return IDENT;
};
