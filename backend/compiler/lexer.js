/**
 * Lexer / Tokenizer for Jocky (.jky) Language
 * Supports custom Jocky (.jky) cybersecurity & compilation syntax.
 */

class Lexer {
  constructor(sourceCode, language = 'jky') {
    this.source = sourceCode || '';
    this.language = (language || 'jky').toLowerCase();
    this.cursor = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize() {
    this.tokens = [];
    this.cursor = 0;
    this.line = 1;
    this.column = 1;

    // Jocky (.jky) Language Keywords
    const keywords = new Set([
      'func', 'function', 'var', 'let', 'const', 'if', 'else', 'while', 'for',
      'return', 'import', 'audit', 'vault', 'risk_score', 'process', 'network',
      'memory', 'int', 'char', 'void', 'auto', 'null', 'true', 'false'
    ]);

    while (this.cursor < this.source.length) {
      const char = this.source[this.cursor];

      // Newline tracking
      if (char === '\n') {
        this.line++;
        this.column = 1;
        this.cursor++;
        continue;
      }

      // Whitespace
      if (/\s/.test(char)) {
        this.cursor++;
        this.column++;
        continue;
      }

      // Single line comments // or #
      if (char === '#' || (char === '/' && this.source[this.cursor + 1] === '/')) {
        let commentVal = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.cursor < this.source.length && this.source[this.cursor] !== '\n') {
          commentVal += this.source[this.cursor];
          this.cursor++;
          this.column++;
        }
        this.tokens.push({ type: 'COMMENT', value: commentVal, line: startLine, column: startCol });
        continue;
      }

      // Block comments /* ... */
      if (char === '/' && this.source[this.cursor + 1] === '*') {
        let commentVal = '';
        const startLine = this.line;
        const startCol = this.column;
        this.cursor += 2;
        this.column += 2;
        while (this.cursor < this.source.length && !(this.source[this.cursor] === '*' && this.source[this.cursor + 1] === '/')) {
          if (this.source[this.cursor] === '\n') {
            this.line++;
            this.column = 1;
          } else {
            this.column++;
          }
          commentVal += this.source[this.cursor];
          this.cursor++;
        }
        if (this.cursor < this.source.length) {
          this.cursor += 2;
          this.column += 2;
        }
        this.tokens.push({ type: 'COMMENT', value: commentVal, line: startLine, column: startCol });
        continue;
      }

      // Imports / Directives: import module or #include
      if (char === '@' || (char === '#' && this.source[this.cursor + 1] !== '/')) {
        let directiveVal = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.cursor < this.source.length && this.source[this.cursor] !== '\n') {
          directiveVal += this.source[this.cursor];
          this.cursor++;
          this.column++;
        }
        this.tokens.push({ type: 'DIRECTIVE', value: directiveVal, line: startLine, column: startCol });
        continue;
      }

      // String literals ("..." or '...' or `...`)
      if (char === '"' || char === "'" || char === '`') {
        const quote = char;
        let strVal = '';
        const startLine = this.line;
        const startCol = this.column;
        this.cursor++;
        this.column++;
        while (this.cursor < this.source.length && this.source[this.cursor] !== quote) {
          if (this.source[this.cursor] === '\\') {
            strVal += this.source[this.cursor];
            this.cursor++;
            this.column++;
          }
          strVal += this.source[this.cursor];
          this.cursor++;
          this.column++;
        }
        if (this.cursor < this.source.length) {
          this.cursor++;
          this.column++;
        }
        this.tokens.push({ type: 'STRING_LITERAL', value: strVal, line: startLine, column: startCol });
        continue;
      }

      // Identifiers and Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let idVal = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.cursor < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.cursor])) {
          idVal += this.source[this.cursor];
          this.cursor++;
          this.column++;
        }

        const type = keywords.has(idVal) ? 'KEYWORD' : 'IDENTIFIER';
        this.tokens.push({ type, value: idVal, line: startLine, column: startCol });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let numVal = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.cursor < this.source.length && /[0-9\.xXAFaf]/.test(this.source[this.cursor])) {
          numVal += this.source[this.cursor];
          this.cursor++;
          this.column++;
        }
        this.tokens.push({ type: 'NUMBER_LITERAL', value: numVal, line: startLine, column: startCol });
        continue;
      }

      // Operators
      if (/[=+\-*\/%&|^!<>:]/.test(char)) {
        let opVal = char;
        const startLine = this.line;
        const startCol = this.column;
        const nextChar = this.source[this.cursor + 1];
        if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '::', '->'].includes(char + nextChar)) {
          opVal += nextChar;
          this.cursor++;
          this.column++;
        }
        this.cursor++;
        this.column++;
        this.tokens.push({ type: 'OPERATOR', value: opVal, line: startLine, column: startCol });
        continue;
      }

      // Delimiters ({ }, ( ), [ ], ;, ,)
      if (/[{}()\[\];,.]/.test(char)) {
        this.tokens.push({
          type: 'DELIMITER',
          value: char,
          line: this.line,
          column: this.column
        });
        this.cursor++;
        this.column++;
        continue;
      }

      // Fallback for unknown symbol
      this.tokens.push({
        type: 'SYMBOL',
        value: char,
        line: this.line,
        column: this.column
      });
      this.cursor++;
      this.column++;
    }

    return this.tokens;
  }
}

module.exports = Lexer;
