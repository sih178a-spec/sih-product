/**
 * Custom Lightweight IR Generator for Jocky (.jky) Files
 * Converts AST into Three-Address Code (TAC) / Low-Level IR instructions
 */

class IRGenerator {
  constructor() {
    this.instructions = [];
    this.tempCounter = 0;
    this.labelCounter = 0;
  }

  newTemp() {
    return `%t${++this.tempCounter}`;
  }

  newLabel() {
    return `L${++this.labelCounter}`;
  }

  generate(ast) {
    this.instructions = [];
    this.tempCounter = 0;
    this.labelCounter = 0;

    if (!ast || !ast.body) return this.instructions;

    for (const node of ast.body) {
      this.processNode(node);
    }

    return this.instructions;
  }

  processNode(node) {
    if (!node) return;

    switch (node.type) {
      case 'JockyFunctionDeclaration':
      case 'FunctionDeclaration': {
        this.instructions.push({
          op: 'FUNC_BEGIN',
          arg1: node.name,
          arg2: `params:[${(node.params || []).join(', ')}]`,
          line: node.line,
          code: `func ${node.name}(${(node.params || []).join(', ')})`
        });

        if (node.body && Array.isArray(node.body)) {
          for (const stmt of node.body) {
            this.processNode(stmt);
          }
        }

        this.instructions.push({
          op: 'FUNC_END',
          arg1: node.name,
          line: node.line,
          code: `endfunc ${node.name}`
        });
        break;
      }

      case 'JockyVariableDeclaration':
      case 'VariableDeclaration': {
        this.instructions.push({
          op: 'ALLOC',
          arg1: node.name,
          arg2: node.kind || node.varType || 'var',
          line: node.line,
          code: `alloc ${node.name} : ${node.kind || node.varType || 'var'}`
        });

        if (node.init) {
          const valRep = this.extractValue(node.init);
          this.instructions.push({
            op: 'STORE',
            arg1: node.name,
            arg2: valRep,
            line: node.line,
            code: `store ${valRep} -> ${node.name}`
          });
        }
        break;
      }

      case 'AssignmentExpression': {
        const valRep = this.extractValue(node.right);
        this.instructions.push({
          op: 'STORE',
          arg1: node.left,
          arg2: valRep,
          line: node.line,
          code: `${node.left} = ${valRep}`
        });
        break;
      }

      case 'CallExpression': {
        const callee = node.callee;
        const argsStr = (node.args || []).map(a => this.extractValue(a)).join(', ');
        
        // Tag Jocky security calls and unsafe functions
        const unsafeCalls = new Set([
          'strcpy', 'strcat', 'gets', 'sprintf', 'vsprintf', 'system',
          'execute_shell', 'raw_sql_exec', 'unsafe_copy', 'raw_eval', 'system_run',
          'exec', 'eval', 'execSync', 'popen', 'mysql_query', 'query'
        ]);

        const op = unsafeCalls.has(callee) ? 'CALL_UNSAFE' : 'CALL';

        this.instructions.push({
          op: op,
          arg1: callee,
          arg2: `args:[${argsStr}]`,
          line: node.line,
          code: `${op} ${callee}(${argsStr})`
        });
        break;
      }

      case 'IfStatement': {
        const condRep = this.extractValue(node.test);
        const elseLabel = this.newLabel();
        this.instructions.push({
          op: 'JMP_FALSE',
          arg1: condRep,
          arg2: elseLabel,
          line: node.line,
          code: `jmp_if_false ${condRep} goto ${elseLabel}`
        });

        if (node.consequent) {
          for (const stmt of node.consequent) {
            this.processNode(stmt);
          }
        }

        this.instructions.push({
          op: 'LABEL',
          arg1: elseLabel,
          line: node.line,
          code: `${elseLabel}:`
        });
        break;
      }

      default: {
        if (node.value) {
          this.instructions.push({
            op: 'RAW_OP',
            arg1: String(node.value),
            line: node.line,
            code: String(node.value)
          });
        }
      }
    }
  }

  extractValue(exprNode) {
    if (!exprNode) return 'null';
    if (typeof exprNode === 'string') return exprNode;
    if (exprNode.value !== undefined) return String(exprNode.value);
    if (exprNode.type === 'BinaryExpression') {
      const left = this.extractValue(exprNode.left);
      const right = this.extractValue(exprNode.right);
      return `(${left} ${exprNode.operator} ${right})`;
    }
    return exprNode.name || 'expr';
  }
}

module.exports = IRGenerator;
