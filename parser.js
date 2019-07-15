
module.exports = function (tokens) {
	var i = 0;
	var j = 0;
	var t = 0;
	var countIfElse = 0;
	var countWhile = 0;	
	var token = null;
	var lookAHead = null;
	var nextToken = function () { return token = tokens[++i]; };
	var lookAHeadFunc = function () { return lookAHead = tokens[i+1]};
	var symbolsTable = {};
	var blockNumb = function () {return ++j;};
	var blockNumbRemove = function () {return --j;};
	var addSymbol = function (type, value, blockNumber) {
		if(symbolsTable[blockNumber] === undefined){
			symbolsTable[blockNumber] = [];
		}
		
		symbolsTable[blockNumber].push({
			'type':  type,
			'value': value
		});
	};
	var removeSymbol = function (blockNumber) { 		
		delete symbolsTable[blockNumber];
		this.j--;
	};
	var checkSymbol = function (value, blockNumber){

		if(symbolsTable[blockNumber] === undefined)
			return false;

	    var i = 0;
		while(i < symbolsTable[blockNumber].length){
			var symbol = symbolsTable[blockNumber][i];

			if(symbol.value == value) {
				return symbol;
			}

			i++;
		}

		return false;

	};
	
	token = tokens[i];
	
	if(token == null || token.type != 'res_INT'){
		console.error("Token 'int' esperado para inicar o programa, na linha "+token.lin+" e coluna "+token.col);
		throw "Error";
	}
	nextToken();

	if(token == null || token.type != 'res_MAIN'){
		console.error("Token 'main' esperado para inicar o programa, na linha "+token.lin+" e coluna "+token.col);
		throw "Error";
	}
	nextToken();

	if(token == null || token.type != 'esp_PARENTESES_ESQUE'){
		console.error("Token '(' esperado para inicar o programa, na linha "+token.lin+" e coluna "+token.col);
		throw "Error";
	}
	nextToken();
	
	if(token == null || token.type != 'esp_PARENTESES_DIREI'){
		console.error("Token ')' esperado para inicar o programa, na linha "+token.lin+" e coluna "+token.col);
		throw "Error";
	}
	nextToken();

	token = blockValidation(token, 0);
	//while(j >= 0){
	//	token = blockValid(token);
	//}
	nextToken();

	if(token != null || token != undefined){
		console.log(token);
		console.error("Token inválido após termino do programa ou fechamento de chaves incompleto, na linha "+token.lin+" e coluna "+token.col);
		throw "Error";
	}

	function firstDeclaration (token){
		if(token.type == 'res_INT')
			return true;
		else if(token.type == 'res_FLOAT')
			return true;
		else if(token.type == 'res_CHAR')
			return true;
		else
			return false;
	};

	function firstCommand (token){
		
		if(firstBasicCommand(token))
			return true;
		else if(firstIteration(token))			
			return true;		
		else if(token.type == 'res_IF')
			return true;
		else	
			return false;
	};

	function firstBasicCommand (token){
		if(firstAtribuiton(token))
			return true;
		else if(firstBlock(token))
			return true;
		else
			return false;
	};

	function firstIteration (token){
		if(token.type == 'res_WHILE')
			return true;
		else if(token.type == 'res_DO')
			return true;
		else
			return false;
	};

	function firstAtribuiton (token){
		if(token.type == 'IDENTIFICADOR')
			return true;
		else
			return false;
	};

	function firstBlock (token){
		if(token.type == 'esp_CHAVES_ESQUE')
			return true;
		else
			return false;
	};

	function firstAriExpression (token){
		if(firstTerm(token))
			return true;
		else
			return false;
	};

	function firstAriExpression_ (token){
		if(token.type == 'ope_SOMA' || token.type == 'ope_SUBTRAÇÃO')
			return true;
		else
			return false;
	};

	function firstRelExpression (token){
		if(firstAriExpression(token))
			return true;
		else
			return false;
	};

	function firstTerm (token){
		if(firstFactor(token))
			return true;
		else
			return false;
	};

	function firstTerm_ (token){
		if(token.type == 'ope_MULTIPLICAÇÃO' || token.type == 'ope_DIVISÃO')
			return true;
		else
			return false;
	};

	function firstFactor (token){
		if(token.type == 'esp_PARENTESES_ESQUE')
			return true;
		else if(token.type == 'IDENTIFICADOR')
			return true;
		else if(token.type == 'NÚMERO')
			return true;
		else if(token.type == 'FLOAT')
			return true;
		else if(token.type == 'CHAR')
			return true;
		else
			return false;
	};	


	function factorValidation (token, blockNumber){
		var aux;
		var highType;
		var aux2;

		if(token.type == 'esp_PARENTESES_ESQUE'){
			token = nextToken();
			if(token.type == 'esp_PARENTESES_DIREI')
				return token;
			token = ariExpressionValidation(token, blockNumber);
			aux = token.temp1;
			aux2 = token.temp2;
			//token = nextToken();
			if(token.type != 'esp_PARENTESES_DIREI'){
				console.error("Token inválido, esperado token ')', na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}			
			
		}else if(token.type == 'IDENTIFICADOR'){
			if(checkSymbol(token.value, blockNumber)){
				aux = checkSymbol(token.value, blockNumber).type;
				aux2 = checkSymbol(token.value, blockNumber).value;				
			}else{
				console.error("Variável não declarada para esse escopo, na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}
		}else if(token.type == 'NÚMERO'){
			aux = token.type;
			aux2 = token.value;
		}else if(token.type == 'FLOAT'){
			aux = token.type;
			aux2 = token.value;
		}else if(token.type == 'CHAR'){
			aux = token.type;
			aux2 = token.value;
		}else{
			console.error("Token inválido, esperado token fator, na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		token.temp1 = aux;
		token.temp2 = aux2;
		return token;
	};

	function termValidation (token, blockNumber){
		var aux1;
		var aux2;
		var highType;
		var t1;

		if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri')
			return token;
		if(firstFactor(token)){
			token = factorValidation(token, blockNumber);
			aux1 = token.temp1;
			t1 = token.temp2;
			token = nextToken();
			if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri'){
				token.temp1 = aux1;
				token.temp2 = t1;
				return token;
			}
			token.temp2 = t1;
			while(firstTerm_(token)){
				token = termValidation_(token, blockNumber, aux1, t1);				
			}
			aux2 = token.temp1;
			highType = maiorTipo(aux1, aux2);
			if(firstAriExpression_(token)){
				token.temp1 = highType;
				return token;
			}
			else if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri'){
				token.temp1 = highType;				
				return token;
			}else{
				console.error("Token inválido, esperado token aritrimétrico ou ';', na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
			}
		}
	};

	function maiorTipo (tipo1, tipo2){
		if(tipo1 == tipo2){
			return tipo1;
		}else if(tipo1 == 'CHAR' || tipo2 == 'CHAR' || tipo1 == 'res_CHAR' || tipo2 == 'res_CHAR'){
			return tipo1;
		}else if(tipo1 == 'res_INT' && tipo2 == 'res_FLOAT'){
			return tipo2;
		}else if(tipo1 == 'res_INT' && tipo2 == 'FLOAT'){
			return tipo2;
		}else if(tipo1 == 'NÚMERO' && tipo2 == 'FLOAT'){
			return tipo2;
		}else if(tipo1 == 'NÚMERO' && tipo2 == 'FLOAT'){
			return tipo2;
		}else if(tipo1 == 'res_FLOAT' && tipo2 == 'res_INT'){
			return tipo1;
		}else if(tipo1 == 'FLOAT' && tipo2 == 'res_INT'){
			return tipo1;
		}else if(tipo1 == 'FLOAT' && tipo2 == 'NÚMERO'){
			return tipo1;
		}else if(tipo1 == 'res_FLOAT' && tipo2 == 'NÚMERO'){
			return tipo1;
		}else
			return tipo1;
	};

	function termValidation_ (token, blockNumber, aux, t1){
		var token1 = aux;
		var token2;
		var aux2;
		var highType;
		var t2;
		var op;

		if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri')
			return token;
		if(token.type != 'ope_MULTIPLICAÇÃO' && token.type != 'ope_DIVISÃO'){
			console.error("Token inválido, esperado tokens '*' ou '/', na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		op = token.value;
		if(token.type == 'ope_DIVISÃO')
			token1 = 'FLOAT';
		token = nextToken();		
		if(firstFactor(token)){
			token = factorValidation(token, blockNumber);
			token2 = token.temp1;
			t2 = token.temp2;
			var valid = verificaTipos(token1, token2);
			if(!valid){
				console.error("Token de tipos diferentes:"+token1+" e "+token2+", na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}
			highType = maiorTipo(token1, token2);
			aux = token2;
			token = nextToken();		
		}
		if(token1 == 'res_FLOAT' && token2 == 'res_INT' || token1 == 'res_FLOAT' && token2 == 'NÚMERO' || token1 == 'FLOAT' && token2 == 'res_INT' || token1 == 'FLOAT' && token2 == 'NÚMERO'){
			console.log("T"+t+" = toFloat("+t2+")");
			token2 = "FLOAT";
			t2 = "T"+t;
			t++;	
		}

		if(token1 == 'res_INT' && token2 == 'FLOAT' || token1 == 'res_INT' && token2 == 'res_FLOAT' || token1 == 'NÚMERO' && token2 == 'FLOAT' || token1 == 'NÚMERO' && token2 == 'res_FLOAT'){
			console.log("T"+t+" = toFloat("+t1+")");
			token1 = "FLOAT";
			t1 = "T"+t;
			t++;	
		}
		console.log("T"+t+" = "+t1+" "+op+" "+t2);
		t1 = "T"+t;
		t++;
		token.temp2 = t1;
		while(firstTerm_(token)){
			token = termValidation_(token, blockNumber, aux, t1);
			aux2 = token.temp1;	
		}
		if(aux2 != undefined)
			highType = maiorTipo(aux2, highType);
		
		if(firstAriExpression_(token)){
			token.temp1 = highType;
			return token;
		}else if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri'){
			token.temp1 = highType;
			return token;
		}else{
			console.error("Token inválido, esperado token aritrimétrico ou ';', na linha "+token.lin+" e coluna "+token.col);
		throw "Error"
		}
	
	};

	function ariExpressionValidation (token, blockNumber){
		var aux = null;
		var highType;
		var t1;
		var t2;
		

		if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri')
			return token;
		if(firstTerm(token)){			
			token = termValidation(token, blockNumber);
			t1 = token.temp2;
			aux = token.temp1;			
			if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri'){
				token.temp1 = aux;
				return token;					
			}
			while(firstAriExpression_(token)){
				token = ariExpressionValidation_(token, blockNumber, aux, t1);
			}
			highType = maiorTipo(aux, token.temp1);			
			if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri'){
				token.temp1 = highType;
				return token;			
			}else{
				console.error("Token inválido, esperado token aritrimétrico ou ';', na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
			}
		}
			
	};

	function ariExpressionValidation_ (token, blockNumber, aux, t1){
		var token1 = aux;
		var token2;
		var aux2;
		var highType;		
		var t2;
		var op;

		if(token.type == 'esp_PONTO_VIRGULA' || token.type.substring(0,6) == 'opeAri')
				return token;
		if(token.type != 'ope_SOMA' && token.type != 'ope_SUBTRAÇÃO'){
			console.error("Token inválido, esperado tokens '+' ou '-', na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		op = token.value;
		token = nextToken(token);
		if(firstTerm(token)){
			token = termValidation(token, blockNumber);
			token2 = token.temp1;
			aux = token2;
			t2 = token.temp2;
		}		
		var valid = verificaTipos(token1, token2);
		if(!valid){
			console.error("Token de tipos diferentes:"+token1+" e "+token2+", na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		if(token1 == 'res_FLOAT' && token2 == 'res_INT' || token1 == 'res_FLOAT' && token2 == 'NÚMERO' || token1 == 'FLOAT' && token2 == 'res_INT' || token1 == 'FLOAT' && token2 == 'NÚMERO'){
			console.log("T"+t+" = toFloat("+t2+")");
			token2 = "FLOAT";
			t2 = "T"+t;
			t++;	
		}

		if(token1 == 'res_INT' && token2 == 'FLOAT' || token1 == 'res_INT' && token2 == 'res_FLOAT' || token1 == 'NÚMERO' && token2 == 'FLOAT' || token1 == 'NÚMERO' && token2 == 'res_FLOAT'){
			console.log("T"+t+" = toFloat("+t1+")");
			token1 = "FLOAT";
			t1 = "T"+t;
			t++;	
		}

		console.log("T"+t+" = "+t1+" "+op+" "+t2);
		t1 = "T"+t;
		t++;
		token.temp2 = t1;
		highType = maiorTipo(token1, token2);
		while(firstAriExpression_(token)){
			token = ariExpressionValidation_(token, blockNumber, aux, t1);
			token2 = token.temp1;						
		}
		highType = maiorTipo(highType, token2);
		if(token.type == 'esp_PONTO_VIRGULA' || token.type == 'esp_PARENTESES_DIREI' || token.type.substring(0,6) == 'opeAri'){
			token.temp1 = highType;			
			return token;
		}else{
			console.error("Token inválido, esperado token aritrimétrico ou ';', na linha "+token.lin+" e coluna "+token.col);
		throw "Error"
		}
	};

	function relExpressionValidation (token, blockNumber){
		var token1 = null;
		var token2 = null;
		var t1 = null;
		var t2 = null;
		var op = null;

		token = ariExpressionValidation(token, blockNumber);
		t1 = token.temp2;
		if(token.temp1)
		token1 = token.temp1;
		
		if(token.type != 'opeAri_MENOR_Q' && token.type != 'opeAri_MAIOR_Q' && token.type != 'opeAri_IGUAL' && token.type != 'opeAri_MAIOR_OU_IGUAL_Q' && token.type != 'opeAri_MENOR_OU_IGUAL_Q' && token.type != 'opeAri_DIFERENTE' ){
			console.error("Token inválido, esperado token relacional, na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		op = token.value;
		token = nextToken();
		token = ariExpressionValidation(token, blockNumber);
		t2 = token.temp2;
		token2 = token.temp1;		
		var valid = verificaTipos(token1, token2);
		if(!valid){
			console.error("Token de tipos diferentes:"+token1+" e "+token2+", na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		console.log("T"+t+" = "+t1+" "+op+" "+t2);
		token.temp2 = "T"+t;
		t++;		
		return token;		
	};

	function atribuitonValidation (token, blockNumber){
		var tipo1 = null;
		var tipo2 = null;
		var v;
		var cast;

		if (token.type == 'IDENTIFICADOR'){
			if(checkSymbol(token.value, blockNumber))
				tipo1 = checkSymbol(token.value, blockNumber).type;
			else{
				console.error("Variável não declarada para esse escopo, na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}
			v = token.value;			
			token = nextToken();			
			if (token.type != 'oper_IGUAL'){
				console.error("Token '=' esperado, na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}else{
				token = nextToken();				
				token = ariExpressionValidation(token, blockNumber);
				tipo2 = token.temp1;							
				var valid = verificaTipos(tipo1, tipo2);
				if(!valid){
					console.error("Token de tipos diferentes:"+token1+" e "+token2+", na linha "+token.lin+" e coluna "+token.col);
					throw "Error"
				}
				if(tipo1 == 'res_INT' && tipo2 == 'FLOAT' || tipo1 == 'res_INT' && tipo2 == 'res_FLOAT'){
					console.error("Não é possível atribuir um float a um inteiro, na linha "+token.lin+" e coluna "+token.col);
					throw "Error"
				}
				if(tipo1 == 'res_FLOAT' && tipo2 == 'res_INT' || tipo1 == 'res_FLOAT' && tipo2 == 'NÚMERO'){
					console.log("T"+t+" = toFloat("+token.temp2+")");
					token.temp2 = "T"+t;
					t++;	
				}
				console.log(v+" = "+token.temp2);												
				if (token.type != 'esp_PONTO_VIRGULA'){
					console.error("Token ';' esperado, na linha "+token.lin+" e coluna "+token.col);
					throw "Error"
				}
				token = nextToken();
			}

		}
		return token;
	};

	function interationValidation (token, blockNumber){
		var count = countWhile;
		countWhile++;
	
		if (token.type == 'res_WHILE'){
			token = nextToken();
			if (token.type != 'esp_PARENTESES_ESQUE'){
				console.error("Token '(' esperado após o comando 'WHILE', na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}else{
				console.log("while_"+count+":");
				token = nextToken();
				while(firstAriExpression(token)){
					token = relExpressionValidation(token, blockNumber);
					if (token.type != 'esp_PARENTESES_DIREI')
						token = nextToken();
				}
				console.log("if ( "+token.temp2+" == 0 ) jump end_while_"+count);
				if (token.type != 'esp_PARENTESES_DIREI'){
					console.error("Token ')' esperado após o comando 'WHILE', na linha "+token.lin+" e coluna "+token.col);
					throw "Error"
				}
				token = nextToken();
				token = commandValidation(token, blockNumber);
				console.log("jump while_"+count);
				console.log("end_while_"+count);
				//token = nextToken();
			}
		}else if (token.type == 'res_DO'){
			token = nextToken();
			console.log("do_while_"+count+":");
			token = commandValidation(token, blockNumber);
			//token = nextToken();
			if (token.type == 'res_WHILE'){
				token = nextToken();
				if (token.type != 'esp_PARENTESES_ESQUE'){
					console.error("Token '(' esperado após o comando 'DO WHILE', na linha "+token.lin+" e coluna "+token.col);
					throw "Error"
				}else{
					token = nextToken();
					token = relExpressionValidation(token, blockNumber);
					if (token.type != 'esp_PARENTESES_DIREI'){
						console.error("Token ')' esperado após o comando 'DO WHILE', na linha "+token.lin+" e coluna "+token.col);
						throw "Error"
					}
					console.log("if ( "+token.temp2+" == 0 ) jump do_while_"+count);
					token = nextToken();
					if (token.type != 'esp_PONTO_VIRGULA'){
						console.error("Token ';' esperado, na linha "+token.lin+" e coluna "+token.col);
						throw "Error"
					}
					token = nextToken();

				}
			}

		}
		return token;
	};

	function verifMaiorTipo(tipo1, tipo2){

		if(tipo1 == 'CHAR' || tipo2 == 'CHAR' || tipo1 == 'res_CHAR' || tipo2 == 'res_CHAR'){
			return tipo1;
		}else if(tipo1 == tipo2){
			return tipo1;
		}else if(tipo1 == 'res_INT'){

		}
		
		
	};

	function basicCommandValidation(token, blockNumber){
		
		if(firstAtribuiton(token))
			token = atribuitonValidation(token, blockNumber);
		else if (firstBlock(token)){
			token = blockValidation(token, blockNumber);
			token = nextToken();
		}
		if(token === undefined){
			console.error("Bloco inciado e não fechado, ultimo token lido na linha "+tokens[i-1].lin+" e coluna "+tokens[i-1].col);
			throw "Error";
		}
		return token;
	};

	function commandValidation (token, blockNumber){
		var temp;
		var count = countIfElse;
		
		countIfElse ++;
		if(firstBasicCommand(token))
			token = basicCommandValidation(token, blockNumber);
		else if (firstIteration(token))
			token = interationValidation(token, blockNumber);
		else if (token.type == 'res_IF'){
			token = nextToken();
			if (token.type != 'esp_PARENTESES_ESQUE'){
				console.error("Token '(' esperado após o comando 'IF', na linha "+token.lin+" e coluna "+token.col);
				throw "Error"
			}else{
				token = nextToken();
				token = relExpressionValidation(token, blockNumber);
				temp = token.temp2; 
				if (token.type != 'esp_PARENTESES_DIREI')
					token = nextToken();
				if (token.type != 'esp_PARENTESES_DIREI'){
					console.error("Token ')' esperado após o comando 'IF', na linha "+token.lin+" e coluna "+token.col);
					throw "Error"
				}
				console.log("if ( "+temp+" == 0 ) jump else_"+count);
				token = nextToken();
				token = commandValidation(token, blockNumber);
				if(token.type == 'esp_CHAVES_DIREI')
					return token;
				//lookAHeadFunc();
				console.log("jump end_if_"+count);
				if(token.type == 'res_ELSE'){
					console.log("else_"+count+":");
					//token = nextToken();
					token = nextToken();
					token = commandValidation(token, blockNumber);
				}
				console.log("end_if_"+count+":");
			}

		}else{
			console.error("Token do tipo Comando esperado, na linha "+token.lin+" e coluna "+token.col);
			throw "Error"
		}
		return token;
	};

	function declarationValidation (token, blockNumber){
		var typeDeclaration;
		
		if(token.type != 'res_INT' && token.type != 'res_FLOAT' && token.type != 'res_CHAR'){
			console.error("Token do tipo 'int', 'float' ou 'char' esperado, na linha "+token.lin+" e coluna "+token.col);
			throw "Error";
		}
		typeDeclaration = token.type;
		token = nextToken();
		if(token.type != 'IDENTIFICADOR'){
			console.error("Token do tipo 'identificador' esperado, na linha "+token.lin+" e coluna "+token.col);
			throw "Error";
		}
		if(checkSymbol(token.value, blockNumber)){
			console.error("Variável já declarada nesse escopo, na linha "+token.lin+" e coluna "+token.col);
			throw "Error";
		}else{
			addSymbol(typeDeclaration, token.value, blockNumber);
		}
		token = nextToken();			
		if(token.type == 'esp_VIRGULA'){
			while(true){
				token = nextToken();
				if(token.type != 'IDENTIFICADOR'){
					console.error("Token do tipo 'identificador' esperado, na linha "+token.lin+" e coluna "+token.col);
					throw "Error";
				}
				if(checkSymbol(token.value, blockNumber)){
					console.error("Variável já declarada nesse escopo, na linha "+token.lin+" e coluna "+token.col);
					throw "Error";
				}else{
					addSymbol(typeDeclaration, token.value, blockNumber);
				}
				token = nextToken();
				if(token.type == 'esp_PONTO_VIRGULA')
					break;
				else if (token.type != 'esp_VIRGULA' && token.type != 'esp_PONTO_VIRGULA' && token.type != 'IDENTIFICADOR' ){
					console.error("Token inválido, ';' ou ',' esperado , na linha "+token.lin+" e coluna "+token.col);
					throw "Error";
				}else if(token.type == 'esp_VIRGULA'){

				}
												
			}								
		}else if(token.type != 'esp_VIRGULA' && token.type != 'esp_PONTO_VIRGULA'){
			console.error("Token inválido, ';' ou ',' esperado , na linha "+token.lin+" e coluna "+token.col);
			throw "Error"; 
		}

		token = nextToken();
		return token;

	};

	function verificaTipos (tipo1, tipo2){
		if(tipo1 != tipo2){
			if(tipo1 == 'res_FLOAT' && tipo2 == 'NÚMERO' || tipo1 == 'FLOAT' && tipo2 == 'res_INT' || tipo1 == 'res_FLOAT' && tipo2 == 'res_INT' || tipo1 == 'FLOAT' && tipo2 == 'NÚMERO' || tipo1 == 'NÚMERO' && tipo2 == 'FLOAT' || tipo1 == 'NÚMERO' && tipo2 == 'res_FLOAT' 
			|| tipo1 == 'res_INT' && tipo2 == 'res_FLOAT' || tipo1 == 'res_INT' && tipo2 == 'FLOAT' ){
				return true;
			}else if(tipo1 == 'res_FLOAT' && tipo2 == 'FLOAT' || tipo1 == 'FLOAT' && tipo2 == 'res_FLOAT'){
				return true;
			}else if(tipo1 == 'CHAR' && tipo2 == 'res_CHAR' || tipo1 == 'res_CHAR' && tipo2 == 'CHAR'){
				return true;
			}else if(tipo1 == 'NÚMERO' && tipo2 == 'res_INT' || tipo1 == 'res_INT' && tipo2 == 'NÚMERO'){
				return true;
			}

		}else
			return true;
		return false;
	}		


	function blockValidation (token, blockNumber) {
		this.j++;
		var blockNumber = j++;
		//console.log(token, i);
		
		if(token == null || token.type != 'esp_CHAVES_ESQUE'){
			console.error("Token '{' esperado para inicar o bloco, na linha "+token.lin+" e coluna "+token.col);
			throw "Error";
		}
		token = nextToken();
		if(token.type == 'esp_CHAVES_DIREI'){
			removeSymbol(blockNumber);
			blockNumbRemove(blockNumber);
			return token;				
		}
		//console.log(token, i);
		while(true){
			if(firstDeclaration(token))
				token = declarationValidation(token, blockNumber);
			else
				break;
		}		
		//throw"a";
		while(true){
			if(firstCommand(token))
				token = commandValidation(token, blockNumber);
			else
				break;
		}
		
		if(token == null || token.type != 'esp_CHAVES_DIREI'){
			console.error("Token '}' esperado para finalizar o bloco, na linha "+token.lin+" e coluna "+token.col);
			throw "Error";
		}
		removeSymbol(blockNumber);
		blockNumbRemove(blockNumber);	

		return token;

	};
	
};