
module.exports =  function (input) {	
	var isOperator = function (c) { return /^[+\-*\/=]$/.test(c); },
		isDigit = function (c) { return /[0-9]/.test(c); },
		isOperatorArit = function (c) { return /^[<>=!]$/.test(c); },
		isFloat = function (c) { return /[0-9]/.test(c); },
		isWhiteSpace = function (c) { return /\s/.test(c); },
		isIdentifier = function (c) { return/^[0-9a-zA-Z_][0-9a-zA-Z_]*$/.test(c);},
		isValidChar = function (c) { return/^[0-9a-zA-Z_]*$/.test(c);},		
		isReserved = function (idn) { return /^(?:main|if|else|while|do|for|int|float|char)$/.test(idn);},
		isSpecial = function (c) { return /^[)\;(\{,\}]$/.test(c)},
		isComments = function (c) { return /\/\*\*(.|\n)+?\*\//.test(c);}

	var tokens = [], c, i = 0, col, lin, temp1, temp2;
	var lookAHead = null;
	var col = 0;
	var lin = 1;	
	var advance = function () { col++; return c = input[++i]; };
	var lookAHeadFunc = function () { return lookAHead = input[i+1]};
	var addToken = function (type, value, col, lin) {
		tokens.push({
			'type':  type,
			'value': value,
			'col':   col,
			'lin':   lin,
			'temp1': temp1,
			'temp2': temp2
		});
	};

	while (i < input.length) {
		c = input[i];
		if (c == '\t')
			col += 4;		
		if (c == '\n') {
			col=0; 
			lin++;
		}
		if (isWhiteSpace(c))						 			
			advance();		
		else if (isOperator(c)) {
			lookAHeadFunc();
			if (c == "/"){
				if (lookAHead != "/" && lookAHead != "*"){
					addToken("ope_DIVISÃO", c, col, lin);
				}
				else{
					if(lookAHead == "/"){
						while (c != '\n'){
							advance();
						}
						col = 0;
						lin++;
					}
					else if (c == "/" && lookAHead == "*"){						
						
						while (c != "*" || lookAHead != "/"){
							if (c == '\t')
								col += 4;		
							if (c == '\n') {
								col=0; 
								lin++;
							}
							advance();
							lookAHeadFunc();
							if(c === undefined && lookAHead === undefined){
								console.error("Fim de comentário esperado, na linha "+lin+" e coluna "+col);
								throw "Error"
							}
						}						
						advance();					
					}

				}

			}
			else if (c == "-")
				addToken("ope_SUBTRAÇÃO", c, col, lin);
			else if (c == "*")
				addToken("ope_MULTIPLICAÇÃO", c, col, lin);
			else if(c == "+")
				addToken("ope_SOMA", c, col, lin);
			else if(c == "=" )
				if(!isOperatorArit(lookAHead))
					addToken("oper_IGUAL", c, col, lin);
				else{
					if(lookAHead == "=")
						addToken("opeAri_IGUAL", c+lookAHead, col, lin);
					advance();
				}			
			advance();
		}
		else if (isOperatorArit(c)){
			lookAHeadFunc();
			if (c == "<" && lookAHead != "=")
				addToken("opeAri_MENOR_Q", c, col, lin);
			else if (c == ">" && lookAHead != "=")
				addToken("opeAri_MAIOR_Q", c, col, lin);
			else if (c == "<" && lookAHead == "="){
				addToken("opeAri_MENOR_OU_IGUAL_Q", c, col, lin);
				advance();
			}else if (c == ">" && lookAHead == "="){
				addToken("opeAri_MAIOR_OU_IGUAL_Q", c, col, lin);
				advance();
			}else if (c == "!"){
				if (lookAHead == "="){
					addToken ("opeAri_DIFERENTE", c+lookAHead, col, lin);
					advance();
				}
				else{
					console.error("Esperado elemento '=' após a exclamção, na linha "+lin+" e coluna "+col);
					throw "Error"
				}	
			}
			advance();
		}
		else if (isDigit(c) || c == "." ) {
			var num = c;
			var isF = 0;
			while (isDigit(advance())) num += c;
			if (c === ".") {
				isF = 1;
				lookAHeadFunc();
				if(!isDigit(lookAHead)){
					console.error("Float mal formado na linha "+lin+" e coluna "+col);
					throw "Error";
				}
				do num += c; while (isDigit(advance()));
				addToken("FLOAT", num, col, lin);
			
			}			
			if(isF != 1)			
				addToken("NÚMERO", num, col, lin);
		}	
		else if (isSpecial(c)){
			if(c == "(")
				addToken("esp_PARENTESES_ESQUE", c, col, lin);
			else if(c == ")")
				addToken("esp_PARENTESES_DIREI", c, col, lin);
			else if(c == "{")
				addToken("esp_CHAVES_ESQUE", c, col, lin);
			else if(c == "}")
				addToken("esp_CHAVES_DIREI", c, col, lin);
			else if(c == ";")
				addToken("esp_PONTO_VIRGULA", c, col, lin);
			else if(c == ",")
				addToken("esp_VIRGULA", c, col, lin);
			advance();
		}
		else if (c == "'"){			
			var count = 0;
			var x = advance();
			while (c != "'"){
				count++;
				advance();
				if(isValidChar(c))
					x += c;
			}
			if(count > 1){				
				console.error("Char inválido, mais de um elemento definido, na linha "+lin+" e coluna "+col);
				throw "Error";			
			}
			if(isValidChar(x))			
				addToken("CHAR", x, col, lin);
			else{
				console.error("Char inválido, não é dígito e nem letra, na linha "+lin+" e coluna "+col);
				throw "Error";
			}
			advance();		
		}		
		else if (isIdentifier(c)) {			
			var idn = c;
			while (isIdentifier(advance())) idn += c;
			if(isReserved(idn)){
				if(idn == "main")
					addToken("res_MAIN", idn, col, lin);
				else if(idn == "if")
					addToken("res_IF", idn, col, lin);
				else if(idn == "else")
					addToken("res_ELSE", idn, col, lin);
				else if(idn == "while")
					addToken("res_WHILE", idn, col, lin);
				else if(idn == "do")
					addToken("res_DO", idn, col, lin);
				else if(idn == "for")
					addToken("res_FOR", idn, col, lin);
				else if(idn == "int")
					addToken("res_INT", idn, col, lin);
				else if(idn == "float")
					addToken("res_FLOAT", idn, col, lin);
				else if(idn == "char")
					addToken("res_CHAR", idn, col, lin);
			}
			else
				addToken("IDENTIFICADOR", idn, col, lin);
		}
		else {
			console.error("Token não reconhecido na linha "+lin+" e coluna "+col);
			throw "Error";
		}
		
	}	
	return tokens;
};