"use strict";
// tokens.js
// 2010-02-23

// Produce an array of simple token objects from a string.
// A simple token object contains these members:
//      type: 'name', 'string', 'number', 'operator'
//      value: string or number value of the token
//      from: index of first character of the token
//      to: index of the last character + 1

// Comments are ignored.

RegExp.prototype.bexec = function(str) {      //metodo para las expresiones regulares que funciona parecido al exec
  var i = this.lastIndex;                     //mira como esta el lastindex de la expresion regular
  var m = this.exec(str);                     //hago un exec normal
  if (m && m.index == i) return m;            //a casado justo donde esta lastIndex?? Casa solo a partir de la posicion lastIndex
  return null;
}

String.prototype.tokens = function () {
    var from;                   // The index of the start of the token.
    var i = 0;                  // The index of the current character.
    var n;                      // The number value.
    var m;                      // Matching
    var result = [];            // An array to hold the results.

    var WHITES              = /\s+/g;
    var ID                  = /[a-zA-Z_]\w*/g;
    var NUM                 = /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g;
    var STRING              = /('(\\.|[^'])*'|"(\\.|[^"])*")/g;
    var ONELINECOMMENT      = /\/\/.*/g;
    var MULTIPLELINECOMMENT = /\/[*](.|\n)*?[*]\//g;
    var TWOCHAROPERATORS    = /([+][+=]|-[-=]|=[=<>]|[<>][=<>]|&&|[|][|])/g;
    var ONECHAROPERATORS    = /([-+*\/=()&|;:,<>{}[\]])/g; // May be some character is missing?
    var tokens = [WHITES, ID, NUM, STRING, ONELINECOMMENT, 
                  MULTIPLELINECOMMENT, TWOCHAROPERATORS, ONECHAROPERATORS ];


    // Make a token object.
    var make = function (type, value) {
        return {
            type: type,
            value: value,
            from: from,
            to: i
        };
    };

    var getTok = function() {
      var str = m[0];
      i += str.length; // Warning! side effect on i
      return str;
    };

    // Begin tokenization. If the source string is empty, return nothing.
    if (!this) return;                                                    //si la cadena no es vacia, si this es false la cadena es vacio

    // Loop through this text
    while (i < this.length) {                              
        tokens.forEach( function(t) { t.lastIndex = i;}); // Only ECMAScript5
        from = i;
        // Ignore whitespace and comments
        if (m = WHITES.bexec(this) ||                                     //si la cadena casa con blancos
           (m = ONELINECOMMENT.bexec(this))  ||                           // es comentario de una linea
           (m = MULTIPLELINECOMMENT.bexec(this))) { getTok(); }           // es comentario de multiples lineas
        // name.
        else if (m = ID.bexec(this)) {                                    
            result.push(make('name', getTok()));
        } 
        // number.
        else if (m = NUM.bexec(this)) {                                   //si casa con numero
            n = +getTok();                                                //lo convierto a numero

            if (isFinite(n)) {                                            //comprobamos si es un numero que se puede almacenar
                result.push(make('number', n));                           
            } else {
                make('number', m[0]).error("Bad number");                 
            }
        } 
        // string
        else if (m = STRING.bexec(this)) {                                
            result.push(make('string', getTok().replace(/^["']|["']$/g,'')));   //quitamos las comillas xk getTok() la devuelve con comillas
        } 
        // two char operator
        else if (m = TWOCHAROPERATORS.bexec(this)) {                            
            result.push(make('operator', getTok()));
        // single-character operator
        } else if (m = ONECHAROPERATORS.bexec(this)){
            result.push(make('operator', getTok()));
        } else {
          throw "Syntax error near '"+this.substr(i)+"'";
        }
    }
    return result;
};

