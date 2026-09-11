/**
 * Comprehensive AST Parser for Jocky (.jky) Language
 * Supports functions, member calls (e.g. console.log, audit.debug), assignments, binary expressions, and control flow.
 */

class Parser {
  constructor(tokens) {
    this.tokens = tokens || [];
    this.pos = 0;
  }

  peek(offset = 0) {
    return this.tokens[this.pos + offset] || null;
  }

  consume() {
    return this.tokens[this.pos++] || null;
  }

  parse() {
    const ast = {
      type: 'JockyProgram',
      body: [],
      line: 1
    };

    while (this.pos < this.tokens.length) {
      const statement = this.parseStatement();
      if (statement) {
        ast.body.push(statement);
      } else {
        this.consume(); // Skip unrecognized token to avoid infinite loops
      }
    }

    return ast;
  }

  parseStatement() {
    const token = this.peek();
    if (!token) return null;

    // Directives & Comments
    if (token.type === 'DIRECTIVE' || token.type === 'COMMENT') {
      const consumed = this.consume();
      return {
        type: consumed.type === 'DIRECTIVE' ? 'ImportDirective' : 'Comment',
        value: consumed.value,
        line: consumed.line
      };
    }

    // Return statement
    if (token.type === 'KEYWORD' && token.value === 'return') {
      const retToken = this.consume();
      const arg = this.parseExpression();
      if (this.peek() && this.peek().value === ';') this.consume();
      return {
        type: 'ReturnStatement',
        argument: arg,
        line: retToken.line
      };
    }

    // Function or Variable declarations
    if (token.type === 'KEYWORD' && ['func', 'function', 'var', 'let', 'const', 'audit', 'vault', 'int', 'char', 'void'].includes(token.value)) {
      return this.parseDeclaration();
    }

    // Conditional statement
    if (token.type === 'KEYWORD' && token.value === 'if') {
      return this.parseIfStatement();
    }

    // While loop
    if (token.type === 'KEYWORD' && token.value === 'while') {
      return this.parseWhileStatement();
    }

    // Identifiers & Member Expressions (e.g. func(), console.log(), x = y)
    if (token.type === 'IDENTIFIER') {
      return this.parseIdentifierOrCall();
    }

    // Fallback expression
    const expr = this.parseExpression();
    if (this.peek() && this.peek().value === ';') {
      this.consume();
    }
    return expr;
  }

  parseDeclaration() {
    const keywordToken = this.consume(); // func, var, let, const
    const nameToken = this.peek();

    if (!nameToken || nameToken.type !== 'IDENTIFIER') {
      return { type: 'JockyDeclaration', keyword: keywordToken.value, line: keywordToken.line };
    }

    this.consume(); // Name
    const afterName = this.peek();

    // Function Declaration: func name(a, b) { ... }
    if (keywordToken.value === 'func' || keywordToken.value === 'function' || (afterName && afterName.value === '(')) {
      if (afterName && afterName.value === '(') this.consume();
      const params = [];
      while (this.peek() && this.peek().value !== ')') {
        const pToken = this.consume();
        if (pToken.type === 'IDENTIFIER' || pToken.type === 'KEYWORD') {
          params.push(pToken.value);
        }
        if (this.peek() && this.peek().value === ',') this.consume();
      }
      if (this.peek() && this.peek().value === ')') this.consume();

      // Function Body
      const body = [];
      if (this.peek() && this.peek().value === '{') {
        this.consume();
        let depth = 1;
        while (this.peek() && depth > 0) {
          if (this.peek().value === '{') depth++;
          if (this.peek().value === '}') depth--;
          if (depth === 0) {
            this.consume();
            break;
          }
          const stmt = this.parseStatement();
          if (stmt) body.push(stmt);
          else this.consume();
        }
      }

      return {
        type: 'JockyFunctionDeclaration',
        name: nameToken.value,
        params,
        body,
        line: keywordToken.line
      };
    }

    // Variable Declaration: var x = expr
    let initValue = null;
    if (afterName && afterName.value === '=') {
      this.consume(); // '='
      initValue = this.parseExpression();
    }

    if (this.peek() && this.peek().value === ';') {
      this.consume();
    }

    return {
      type: 'JockyVariableDeclaration',
      kind: keywordToken.value,
      name: nameToken.value,
      init: initValue,
      line: keywordToken.line
    };
  }

  parseIdentifierOrCall() {
    const startToken = this.peek();
    let fullname = this.consume().value;

    // Support member expressions like console.log or audit.debug
    while (this.peek() && this.peek().value === '.') {
      this.consume(); // '.'
      if (this.peek() && (this.peek().type === 'IDENTIFIER' || this.peek().type === 'KEYWORD')) {
        fullname += '.' + this.consume().value;
      }
    }

    // Function Call Expression: name(...)
    if (this.peek() && this.peek().value === '(') {
      this.consume(); // '('
      const args = [];
      while (this.peek() && this.peek().value !== ')') {
        const argExpr = this.parseExpression();
        if (argExpr) args.push(argExpr);
        if (this.peek() && this.peek().value === ',') {
          this.consume();
        }
      }
      if (this.peek() && this.peek().value === ')') this.consume();
      if (this.peek() && this.peek().value === ';') this.consume();

      return {
        type: 'CallExpression',
        callee: fullname,
        args,
        line: startToken ? startToken.line : 1
      };
    }

    // Assignment Expression: x = y
    if (this.peek() && ['=', '+=', '-='].includes(this.peek().value)) {
      const opToken = this.consume();
      const valueExpr = this.parseExpression();
      if (this.peek() && this.peek().value === ';') this.consume();

      return {
        type: 'AssignmentExpression',
        operator: opToken.value,
        left: fullname,
        right: valueExpr,
        line: startToken ? startToken.line : 1
      };
    }

    if (this.peek() && this.peek().value === ';') this.consume();
    return { type: 'Identifier', value: fullname, line: startToken ? startToken.line : 1 };
  }

  parseIfStatement() {
    const ifToken = this.consume();
    let testExpr = null;
    if (this.peek() && this.peek().value === '(') {
      this.consume();
      testExpr = this.parseExpression();
      if (this.peek() && this.peek().value === ')') this.consume();
    }

    const consequent = [];
    if (this.peek() && this.peek().value === '{') {
      this.consume();
      let depth = 1;
      while (this.peek() && depth > 0) {
        if (this.peek().value === '{') depth++;
        if (this.peek().value === '}') depth--;
        if (depth === 0) {
          this.consume();
          break;
        }
        const stmt = this.parseStatement();
        if (stmt) consequent.push(stmt);
        else this.consume();
      }
    }

    return {
      type: 'IfStatement',
      test: testExpr,
      consequent,
      line: ifToken ? ifToken.line : 1
    };
  }

  parseWhileStatement() {
    const whileToken = this.consume();
    let testExpr = null;
    if (this.peek() && this.peek().value === '(') {
      this.consume();
      testExpr = this.parseExpression();
      if (this.peek() && this.peek().value === ')') this.consume();
    }

    const body = [];
    if (this.peek() && this.peek().value === '{') {
      this.consume();
      let depth = 1;
      while (this.peek() && depth > 0) {
        if (this.peek().value === '{') depth++;
        if (this.peek().value === '}') depth--;
        if (depth === 0) {
          this.consume();
          break;
        }
        const stmt = this.parseStatement();
        if (stmt) body.push(stmt);
        else this.consume();
      }
    }

    return {
      type: 'WhileStatement',
      test: testExpr,
      body,
      line: whileToken ? whileToken.line : 1
    };
  }

  parseExpression() {
    const token = this.peek();
    if (!token) return null;

    if (token.type === 'STRING_LITERAL') {
      return { type: 'StringLiteral', value: this.consume().value, line: token.line };
    }
    if (token.type === 'NUMBER_LITERAL') {
      return { type: 'NumberLiteral', value: this.consume().value, line: token.line };
    }

    if (token.type === 'IDENTIFIER') {
      const startLine = token.line;
      let fullname = this.consume().value;
      while (this.peek() && this.peek().value === '.') {
        this.consume();
        if (this.peek() && (this.peek().type === 'IDENTIFIER' || this.peek().type === 'KEYWORD')) {
          fullname += '.' + this.consume().value;
        }
      }

      if (this.peek() && this.peek().value === '(') {
        this.pos--;
        return this.parseIdentifierOrCall();
      }

      if (this.peek() && ['+', '-', '*', '/', '==', '!=', '<', '>'].includes(this.peek().value)) {
        const op = this.consume().value;
        const right = this.parseExpression();
        return {
          type: 'BinaryExpression',
          operator: op,
          left: fullname,
          right,
          line: startLine
        };
      }

      return { type: 'Identifier', value: fullname, line: startLine };
    }

    return { type: 'RawExpression', value: this.consume().value, line: token.line };
  }
}

module.exports = Parser;
