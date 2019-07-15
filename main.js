

/*
	Leitura de arquivo
*/

if(!process.argv[2]){
	return console.error('Passe um diretório de arquivo há ser compilado');
}

var file = process.argv[2]
   ,fileData = '';

fs = require('fs');

try{
	fileData = fs.readFileSync(file, 'utf-8');
} catch (e){
  	return console.error('Falha na leitura do arquivo.');
}


/*
	Criação de scaner;
*/
var tokens = require('./scanner')(fileData);
//console.log(tokens);
/*
	Criação do parser;
*/
var parser = require('./parser')(tokens);



