var main, parse;

main = function() {
  var result, source;
  source = original.value;
  try {
    result = JSON.stringify(parse(source), null, 2);
  } catch (_error) {
    result = _error;
    result = "<div class=\"error\">" + result + "</div>";
  }
  return OUTPUT.innerHTML = result;
};

window.onload = function() {
  return PARSE.onclick = main;
};

Object.constructor.prototype.error = function(message, t) {
  t = t || this;
  t.name = "SyntaxError";
  t.message = message;
  throw treturn;
};

RegExp.prototype.bexec = function(str) {
  var i, m;
  i = this.lastIndex;
  m = this.exec(str);
  if (m && m.index === i) {
    return m;
  }
  return null;
};

String.prototype.tokens = function() {
  var RESERVED_WORD, from, getTok, i, key, m, make, n, result, rw, tokens, value;
  from = void 0;
  i = 0;
  n = void 0;
  m = void 0;
  result = [];
  tokens = {
    WHITES: /\s+/g,
    ID: /[a-zA-Z_]\w*/g,
    NUM: /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g,
    STRING: /('(\\.|[^'])*'|"(\\.|[^"])*")/g,
    ONELINECOMMENT: /\/\/.*/g,
    MULTIPLELINECOMMENT: /\/[*](.|\n)*?[*]\//g,
    COMPARISONOPERATOR: /[<>=!]=|[<>]/g,
    ADDOP: /[+-]/g,
    MULTOP: /[*\/]/g,
    ONECHAROPERATORS: /([=()&|;:,{}[\]])/g
  };
  RESERVED_WORD = {
    p: "P",
    "if": "IF",
    then: "THEN",
    begin: "BEGIN",
    end: "END",
    "var": "VAR",
    "const": "CONST",
    procedure: "PROCEDURE",
    call: "CALL",
    procedure: "PROCEDURE",
    "while": "WHILE",
    "do": "DO",
    odd: "ODD"
  };
  make = function(type, value) {
    return {
      type: type,
      value: value,
      from: from,
      to: i
    };
  };
  getTok = function() {
    var str;
    str = m[0];
    i += str.length;
    return str;
  };
  if (!this) {
    return;
  }
  while (i < this.length) {
    for (key in tokens) {
      value = tokens[key];
      value.lastIndex = i;
    }
    from = i;
    if (m = tokens.WHITES.bexec(this) || (m = tokens.ONELINECOMMENT.bexec(this)) || (m = tokens.MULTIPLELINECOMMENT.bexec(this))) {
      getTok();
    } else if (m = tokens.ID.bexec(this)) {
      rw = RESERVED_WORD[m[0]];
      if (rw) {
        result.push(make(rw, getTok()));
      } else {
        result.push(make("ID", getTok()));
      }
    } else if (m = tokens.NUM.bexec(this)) {
      n = +getTok();
      if (isFinite(n)) {
        result.push(make("NUM", n));
      } else {
        make("NUM", m[0]).error("Bad number");
      }
    } else if (m = tokens.STRING.bexec(this)) {
      result.push(make("STRING", getTok().replace(/^["']|["']$/g, "")));
    } else if (m = tokens.COMPARISONOPERATOR.bexec(this)) {
      result.push(make("COMPARISON", getTok()));
    } else if (m = tokens.ADDOP.bexec(this)) {
      result.push(make("ADDOP", getTok()));
    } else if (m = tokens.MULTOP.bexec(this)) {
      result.push(make("MULTOP", getTok()));
    } else if (m = tokens.ONECHAROPERATORS.bexec(this)) {
      result.push(make(m[0], getTok()));
    } else {
      throw "Syntax error near '" + (this.substr(i)) + "'";
    }
  }
  return result;
};

parse = function(input) {
  var block, condition, expression, factor, lookahead, match, program, statement, statements, term, tokens, tree;
  tokens = input.tokens();
  lookahead = tokens.shift();
  match = function(t) {
    if (lookahead.type === t) {
      lookahead = tokens.shift();
      if (typeof lookahead === "undefined") {
        lookahead = null;
      }
    } else {
      throw ("Syntax Error. Expected " + t + " found '") + lookahead.value + "' near '" + input.substr(lookahead.from) + "'";
    }
  };
  program = function() {
    var result;
    result = block();
    if (lookahead && lookahead.type === ".") {
      match(".");
    } else {
      throw "Syntax Error. Expected '.' Remember to end your input with a .";
    }
    return result;
  };
  block = function() {
    var arrayres, constante, proced, variable;
    arrayres = [];
    if (lookahead && lookahead.type === "CONST") {
      match("CONST");
      constante = function() {
        var left, result, right;
        result = null;
        if (lookahead && lookahead.type === "ID") {
          left = {
            type: "Const ID",
            value: lookahead.value
          };
          match("ID");
          match("=");
          if (lookahead && lookahead.type === "NUM") {
            right = {
              type: "NUM",
              value: lookahead.value
            };
            match("NUM");
          } else {
            throw "Syntax Error. Expected NUM but found " + (lookahead ? lookahead.value : "end of input") + (" near '" + (input.substr(lookahead.from)) + "'");
          }
        } else {
          throw "Syntax Error. Expected ID but found " + (lookahead ? lookahead.value : "end of input") + (" near '" + (input.substr(lookahead.from)) + "'");
        }
        result = {
          type: "=",
          left: left,
          right: right
        };
        return result;
      };
      arrayres.push(constante());
      while (lookahead && lookahead.type === ",") {
        match(",");
        arrayres.push(constante());
      }
      match(";");
    }
    if (lookahead && lookahead.type === "VAR") {
      match("VAR");
      variable = function() {
        var result;
        result = null;
        if (lookahead && lookahead.type === "ID") {
          result = {
            type: "Var ID",
            value: lookahead.value
          };
          match("ID");
        } else {
          throw "Syntax Error. Expected ID but found " + (lookahead ? lookahead.value : "end of input") + (" near '" + (input.substr(lookahead.from)) + "'");
        }
        return result;
      };
      arrayres.push(variable());
      while (lookahead && lookahead.type === ",") {
        match(",");
        arrayres.push(variable());
      }
      match(";");
    }
    proced = function() {
      var result, value;
      result = null;
      match("PROCEDURE");
      if (lookahead && lookahead.type === "ID") {
        value = lookahead.value;
        match("ID");
        match(";");
        result = {
          type: "Procedure",
          value: value,
          left: block()
        };
        match(";");
      } else {
        throw "Syntax Error. Expected ID but found " + (lookahead ? lookahead.value : "end of input") + (" near '" + (input.substr(lookahead.from)) + "'");
      }
      return result;
    };
    while (lookahead && lookahead.type === "PROCEDURE") {
      arrayres.push(proced());
    }
    arrayres.push(statement());
    return arrayres;
  };
  statements = function() {
    var result;
    result = [statement()];
    while (lookahead && lookahead.type === ";") {
      match(";");
      result.push(statement());
    }
    if (result.length === 1) {
      return result[0];
    } else {
      return result;
    }
  };
  statement = function() {
    var left, result, right;
    result = null;
    if (lookahead && lookahead.type === "ID") {
      left = {
        type: "ID",
        value: lookahead.value
      };
      match("ID");
      match("=");
      right = expression();
      result = {
        type: "=",
        left: left,
        right: right
      };
    } else if (lookahead && lookahead.type === "P") {
      match("P");
      right = expression();
      result = {
        type: "P",
        value: right
      };
    } else if (lookahead && lookahead.type === "IF") {
      match("IF");
      left = condition();
      match("THEN");
      right = statement();
      result = {
        type: "IF",
        left: left,
        right: right
      };
    } else if (lookahead && lookahead.type === "BEGIN") {
      match("BEGIN");
      result = [statement()];
      while (lookahead && lookahead.type === ";") {
        match(";");
        resut.push(statement());
      }
      match("END");
    } else if (lookahead && lookahead.type === "CALL") {
      match("CALL");
      result = {
        type: "CALL",
        value: lookahead.value
      };
      match("ID");
    } else if (lookahead && lookahead.type === "WHILE") {
      match("WHILE");
      left = condition();
      match("DO");
      right = statement();
      result = {
        type: "WHILE",
        left: left,
        right: right
      };
    } else {
      throw "Syntax Error. Expected identifier but found " + (lookahead ? lookahead.value : "end of input") + (" near '" + (input.substr(lookahead.from)) + "'");
    }
    return result;
  };
  condition = function() {
    var left, result, right, type;
    if (lookahead && lookahead.type === "ODD") {
      match("ODD");
      right = expression();
      result = {
        type: "ODD",
        value: right
      };
    } else {
      left = expression();
      type = lookahead.value;
      match("COMPARISON");
      right = expression();
      result = {
        type: type,
        left: left,
        right: right
      };
    }
    return result;
  };
  expression = function() {
    var result, right, type;
    result = term();
    while (lookahead && lookahead.type === "ADDOP") {
      type = lookahead.value;
      match("ADDOP");
      right = term();
      result = {
        type: type,
        left: result,
        right: right
      };
    }
    return result;
  };
  term = function() {
    var result, right, type;
    result = factor();
    if (lookahead && lookahead.type === "MULTOP") {
      type = lookahead.value;
      match("MULTOP");
      right = factor();
      result = {
        type: type,
        left: result,
        right: right
      };
    }
    return result;
  };
  factor = function() {
    var result;
    result = null;
    if (lookahead.type === "NUM") {
      result = {
        type: "NUM",
        value: lookahead.value
      };
      match("NUM");
    } else if (lookahead.type === "ID") {
      result = {
        type: "ID",
        value: lookahead.value
      };
      match("ID");
    } else if (lookahead.type === "(") {
      match("(");
      result = expression();
      match(")");
    } else {
      throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
    }
    return result;
  };
  tree = statements(input);
  if (lookahead != null) {
    throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
  }
  return tree;
};

window.parse = parse;

