import * as token from "../token/index.ts";

const bufferFrom = (code: string) => {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(code);

  return buffer;
};

const decode = (buffer: Uint8Array) => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

const isLetter = (ch: string) => {
  return ch.match(/[A-Za-z_]/);
};

const isDigit = (ch: string) => {
  return ch.match(/[0-9]/);
};

class Lexer {
  input: string; // コード
  position: number; // 入力における現在の位置（現在の文字を指し示す）
  readPosition: number; // これから読み込む位置（現在の文字の次）
  EOF: boolean; // EOFに達したかどうか
  ch: string; // 現愛検査中の文字

  constructor(code: string) {
    this.input = code;
    this.position = 0;
    this.readPosition = 0;
    this.EOF = false;
    this.ch = "";
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.EOF = true;
      this.ch = "";
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  readIdentifier(): string {
    const position = this.position;

    while (
      isLetter(this.ch as string)
    ) {
      this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  readNumber(): string {
    const position = this.position;

    while (isDigit(this.ch as string)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  readString(): string {
    const position = this.position + 1;

    while (true) {
      this.readChar();
      if (this.ch === '"' || this.EOF) {
        break;
      }
    }

    return this.input.slice(position, this.position);
  }

  nextToken(): token.Token {
    let tok: token.Token;

    this.skipWhitespace();

    if (this.EOF) {
      tok = newToken(token.EOF, this.ch);
    } else {
      switch (this.ch) {
        case "=":
          if (this.peekChar() === "=") {
            const ch = this.ch;
            this.readChar();
            const literal = `${ch}${this.ch}`;
            tok = {
              Type: token.EQ,
              Literal: literal,
            };
          } else {
            tok = newToken(token.ASSIGN, this.ch);
          }
          break;
        case "+":
          tok = newToken(token.PLUS, this.ch);
          break;
        case "-":
          tok = newToken(token.MINUS, this.ch);
          break;
        case "!":
          if (this.peekChar() === "=") {
            const ch = this.ch;
            this.readChar();
            const literal = `${ch}${this.ch}`;
            tok = {
              Type: token.NOT_EQ,
              Literal: literal,
            };
          } else {
            tok = newToken(token.BANG, this.ch);
          }
          break;
        case "/":
          tok = newToken(token.SLASH, this.ch);
          break;
        case "*":
          tok = newToken(token.ASTERISK, this.ch);
          break;
        case "<":
          tok = newToken(token.LT, this.ch);
          break;
        case ">":
          tok = newToken(token.GT, this.ch);
          break;
        case ";":
          tok = newToken(token.SEMICOLON, this.ch);
          break;
        case ",":
          tok = newToken(token.COMMA, this.ch);
          break;
        case "{":
          tok = newToken(token.LBRACE, this.ch);
          break;
        case "}":
          tok = newToken(token.RBRACE, this.ch);
          break;
        case "(":
          tok = newToken(token.LPAREN, this.ch);
          break;
        case ")":
          tok = newToken(token.RPAREN, this.ch);
          break;
        case '"':
          tok = {
            Type: token.STRING,
            Literal: this.readString(),
          };
          break;
        case "[":
          tok = newToken(token.LBRACKET, this.ch);
          break;
        case "]":
          tok = newToken(token.RBRACKET, this.ch);
          break;
        case ":":
          tok = newToken(token.COLON, this.ch);
          break;
        default:
          if (isLetter(this.ch)) {
            const literal = this.readIdentifier();
            const type = token.lookupIdent(literal);
            return {
              Type: type,
              Literal: literal,
            };
          } else if (isDigit(this.ch)) {
            return {
              Type: token.INT,
              Literal: this.readNumber(),
            };
          } else {
            tok = newToken(token.ILLEGAL, this.ch);
          }
      }
    }

    this.readChar();

    return tok;
  }

  peekChar(): string | 0 {
    if (this.readPosition >= this.input.length) {
      return 0;
    } else {
      return this.input[this.readPosition];
    }
  }

  skipWhitespace() {
    // 現在が、空白、tab、改行なら読み進める。
    while (
      this.ch === " " || this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }
}

export const New = (input: string): Lexer => {
  const l = new Lexer(input);
  l.readChar();
  return l;
};

const newToken = (tokenType: token.TokenType, ch: string): token.Token => {
  return {
    Type: tokenType,
    Literal: ch,
  };
};
