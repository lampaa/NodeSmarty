var express = require('./libs/express');
var app = express();

/**
 *
 */
var mySql = require('mysql');

/**
 * template engine
 */
var NodeSmarty = require('./libs/NodeSmarty');
var Template = NodeSmarty();

Template
   .setTemplateDir('./views/templates/')
   .setCompileDir('./views/compile/')
   .setCacheDir('./views/cache/'); 
   
   
Template.assign({
	'TITLE':'NodeSmarty',
	'copyright':'NodeSmarty.com'
});
   

app.get('/', function(req, res){
	mySql.query('SELECT * FROM test', function(error, result, fields){

        if (error){
            throw error;
        }
		
		Template.assign({
			'values':fields
		}); 
		
		var Final = Template.fetchSync('data.html');
		
		res.send(Final);

		client.end();
    });	
});

app.listen(3000);