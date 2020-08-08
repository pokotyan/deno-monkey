import * as util from "../util/index.ts";

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

export type TokenType = util.ValueOf<TOKEN>;

export type TOKEN = {
  ILLEGAL: "ILLEGAL";
  EOF: "EOF";
  IDENT: "IDENT";
  INT: "INT";
  STRING: "STRING";
  ASSIGN: "=";
  PLUS: "+";
  MINUS: "-";
  BANG: "!";
  ASTERISK: "*";
  SLASH: "/";
  LT: "<";
  GT: ">";
  EQ: "==";
  NOT_EQ: "!=";
  COMMA: ",";
  SEMICOLON: ";";
  COLON: ":";
  LPAREN: "(";
  RPAREN: ")";
  LBRACE: "{";
  RBRACE: "}";
  LBRACKET: "[";
  RBRACKET: "]";
  FUNCTION: "FUNCTION";
  LET: "LET";
  TRUE: "TRUE";
  FALSE: "FALSE";
  IF: "IF";
  ELSE: "ELSE";
  RETURN: "RETURN";
};

// export type PREFIX_TOKEN = {
//   IDENT: "IDENT";
//   INT: "INT";
//   STRING: "STRING";
//   MINUS: "-";
//   BANG: "!";
//   LPAREN: "(";
//   LBRACE: "{";
//   LBRACKET: "[";
//   FUNCTION: "FUNCTION";
//   TRUE: "TRUE";
//   FALSE: "FALSE";
//   IF: "IF";
// };

// export type INFIX_TOKEN = {
//   PLUS: "+";
//   MINUS: "-";
//   ASTERISK: "*";
//   SLASH: "/";
//   LT: "<";
//   GT: ">";
//   EQ: "==";
//   NOT_EQ: "!=";
//   LPAREN: "(";
//   LBRACKET: "[";
// };

export type Token = {
  Type: TokenType;
  Literal: string;
};

const keywords: {
  [k: string]: KEYWORDS;
} = {
  "fn": FUNCTION,
  "let": LET,
  "true": TRUE,
  "false": FALSE,
  "if": IF,
  "else": ELSE,
  "return": RETURN,
};

type KEYWORDS =
  | typeof FUNCTION
  | typeof LET
  | typeof TRUE
  | typeof FALSE
  | typeof IF
  | typeof ELSE
  | typeof RETURN;

export const lookupIdent = (ident: string): KEYWORDS | typeof IDENT => {
  const tok = keywords[ident];

  if (tok) {
    return tok;
  }

  return IDENT;
};
