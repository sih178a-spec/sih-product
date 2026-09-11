const Lexer = require('./compiler/lexer');
const Parser = require('./compiler/parser');
const IRGenerator = require('./compiler/irGenerator');
const RiskScorer = require('./compiler/riskScorer');

const sampleJockyCode = `
@import "jocky/audit"
@import "jocky/vault"

func execute_user_query(userInput) {
    var query = alloc_buffer(128);
    unsafe_copy(query, userInput);
    execute_shell(query);
}
`;

console.log('Testing .jky Lexer...');
const lexer = new Lexer(sampleJockyCode, 'jky');
const tokens = lexer.tokenize();
console.log(`Tokens generated: ${tokens.length}`);

console.log('Testing .jky Parser...');
const parser = new Parser(tokens);
const ast = parser.parse();
console.log(`AST root node: ${ast.type}, body count: ${ast.body.length}`);

console.log('Testing .jky IR Generator...');
const irGen = new IRGenerator();
const ir = irGen.generate(ast);
console.log(`IR instructions generated: ${ir.length}`);
ir.forEach(i => console.log(`  [IR] ${i.code}`));

console.log('Testing .jky Risk Scorer...');
const scorer = new RiskScorer();
const evalRes = scorer.evaluate(sampleJockyCode, tokens, ast, ir);
console.log(`Total Risk Score: ${evalRes.totalRiskScore}`);
console.log(`Overall Severity: ${evalRes.overallRiskSeverity}`);
console.log(`Findings count: ${evalRes.findings.length}`);
evalRes.findings.forEach(f => {
  console.log(`  - [${f.severity}] ${f.title} (CWE: ${f.cweId}, Line: ${f.lineNumber})`);
});
