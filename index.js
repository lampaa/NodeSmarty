/**
 * NodeSmarty
 * @author lampa (http://nodesmarty.com, http://lampacore.ru/nodesmarty)
 * @version 2.beta
 */
exports = module.exports = NodeSmarty;

function NodeSmarty() {	
	NodeSmarty.func.init.prototype = NodeSmarty.func;
	return new NodeSmarty.func.init();
};

NodeSmarty.func = {
	constructor: NodeSmarty,
	
	assignes: {},
	ldq:'{',
	rdq:'}',
	
	_foreach_master: {'if':false, 'counter':0, 'variables':{}, 'variables_vars':{}},	// private
	_CompileDir:false,
	_TemplateDir:false,
	_CacheDir:false,
	_preCompiler:{},
	
	//_memCompile: false,
	//_memCache: false,
	/**
	 * initializate
	 */
	init: function() {
		
		this.attrs_pre_regexp = /["\']?(\S\w*)["\']?\s*=\s*(["\'](.*?)["\']|(\S+))/g;
		this.attrs_regexp = /["\']?(\S\w*)["\']?\s*=\s*(?:["\'](.+)["\']|(\S+))/;
		
		this._fs = require('fs');
	
		/**
		 * 
		 */
		this._math_regexp = /^\S+(\%|\+|\-|\*|\/)/g;
		this._math_regexp_split = /\%|\+|\-|\*|\//;
		this._slash_regexp = /\//g;
		this._string_rgexp = /^\w+$/;
		this._line_regexp = /(\r\n|\n|\r)/gm;
		this._replace_shashes_regexp = /\\?("|')/g;
		this._template_tags_commands_regexp = new RegExp(this.ldq+'(.*?)(?:\\s+(.*)|)'+this.rdq, "");
		
		this._template_tags_regexp = new RegExp(this.ldq+"\\s*(.*?)\\s*"+this.rdq,'g');
		this._text_blocks_regexp = new RegExp(this.ldq+".*?"+this.rdq,'g')
		this._searchLiteral_pre = new RegExp(this.ldq+"\\*([\\S\\s]*?)\\*"+this.rdq+"|"+this.ldq+"\\s*literal\\s*"+this.rdq+"([\\S\\s]*?)"+this.ldq+"\\s*/literal\\s*"+this.rdq+"|"+this.ldq+"\\s*javascript\\s*"+this.rdq+"([\\S\\s]*?)"+this.ldq+"\\s*/javascript\\s*"+this.rdq,'g');
		this._searchLiteral = new RegExp(this.ldq+"\\s*([\\S\\s]*?)\\s*"+this.rdq+"(?:([\\S\\s]*?)"+this.ldq+"\s*\\/(.*?)\\s*"+this.rdq+"|)", '');
			
		/**
		 * 
		 */
		this._slash_replace = '%2F';
		this._replace_assignes = /__this\.assignes/i;
		
		/**
		 * 
		 */
		this._match_if_tag = /(\-?0[xX][0-9a-fA-F]+|\-?\d+(?:\.\d+)?|\$\w+|\.\d+|!==|===|==|!=|<>|<<|>>|<=|>=|\&\&|\|\||\(|\)|,|\!|\^|=|\&|\~|<|>|\||\%|\+|\-|\/|\*|@|\b\w+\b\S+)/g;
		  

		return this;
	},
	
	/**
	 * setup template directory
	 */
	setTemplateDir: function (dir) {
		var stats = this._fs.lstatSync(dir);

		if (stats.isDirectory()) {
			this._TemplateDir = dir;
		}
		else {
			return this._syntax_error('setTemplateDir: template dir "'+dir+'" not found!'); // return false;
		}
		return this;	
	},
	
	/**
	 * setup compile directory
	 */
	setCompileDir: function(dir) {
		var stats = this._fs.lstatSync(dir);

		if (stats.isDirectory()) {
			this._CompileDir = dir;
		}
		else {
			return this._syntax_error('setCompileDir: compile dir "'+dir+'" not found!');
		}
		return this;
	},
	
	/**
	 * setup cache directory
	 */
	setCacheDir: function(dir) {
		var stats = this._fs.lstatSync(dir);

		if (stats.isDirectory()) {
			this._CacheDir = dir;
		}
		else {
			return this._syntax_error('setCacheDir: cache dir "'+dir+'" not found!');
		}
		return this;
	},
	
	/**
	 * assign variables
	 */
	assign: function(data, value) {
		if(value == undefined && typeof data == 'string') {
			return false;
		}
		
		if(typeof value == 'string' && typeof data == 'string') {
			this.assignes[data] = value;
		}
		
		if(typeof data == 'object') {
			for(var me in data) {
				this.assignes[me] = data[me];
			}
		}
		
		return this;
	},
	
	/**
	 * clear assign variables
	 */
	clearAssign: function(assign) {
		if(assign == undefined) {
			this.assignes = {};
		}
		else {
			delete this.assignes[assign];
		}
	},
	
	/**
	 * get assigned values
	 */
	getTemplateVars: function(assign) {
		if(assign == undefined) {
			return this.assignes;
		}
		else {
			return this.assignes[assign];
		}
	},
	
	/**
	 * clear cache dir
	 */
	clearCache: function() {
		if(!this._CacheDir) {
			return this._syntax_error('clearCache: cache dir not set');
		}
		
		var _this = this;
		//
		this._fs.readdir(this._CacheDir, function(err, files) {

			for(var i=0; i < files.length; i++) {
				var filePath = _this._CacheDir + files[i];
				_this.fs.unlink(filePath);
			};
		});
	},
	
	/**
	 * clear cache dir sync
	 */
	clearCacheSync: function() {
		if(!this._CacheDir) {
			return this._syntax_error('clearCacheSync: cache dir not set');
		}
		
		var files = this._fs.readdirSync(this._CacheDir); 
		
		for(var file in files) {	
			this._fs.unlink(this._CacheDir+files[file]);
		}
		return true;
	},
	
	/**
	 * clear compile dir
	 */
	clearCompile: function() {		
		if(!this._CompileDir) {
			return this._syntax_error('clearCompile: compile dir not set');
		}
		
		var _this = this;
		//
		this._fs.readdir(this._CompileDir, function(err, files) {
		
			for(var i=0; i < files.length; i++) {
				var filePath = _this._CompileDir + files[i];
				_this.fs.unlink(filePath);
			};
		});
	},
	
	/**
	 * clear compile dir sync
	 */
	clearCompileSync: function() {	
		if(!this._CompileDir) {
			return this._syntax_error('clearCompileSync: compile dir not set');
		}
		
		var files = this._fs.readdirSync(this._CompileDir); 
		
		for(var file in files) {	
			this._fs.unlink(this._CompileDir+files[file]);
		}
		return true;
	},

	/**
	 * parse tags (if, foreach, else, etc)
	 */
	_parseTags: function(template_tag) {
		
		var match = template_tag.match(this._template_tags_commands_regexp);
		
		if(match == null) {
			this._syntax_error("unrecognized tag: "+ template_tag);
			return;
		}
		
		// tag
		var tag_command = match[1];
		// arguments
		var tag_args = (match[2] != null) ? match[2] : null;

		/**
		 * parse mathematic tags 
		 */
		if(this._math_regexp.test(tag_command)) {
			
			var tag_command_array = tag_command.split(this._math_regexp_split);
			//
			for(match=0; match < tag_command_array.length; match++) {
				tag_command = tag_command.replace(tag_command_array[match], "Number("+this._parse_vars(tag_command_array[match])+")");
			}
				
			return "content += "+tag_command+";\n";		
		}
		/**
		 * if variable
		 */	
		else if(tag_command[0] === '$') {
			return "content += "+this._parse_vars(tag_command)+";\n";
		}
		
		
		switch (tag_command) {
			case 'include':
				return this._compile_include_tag(tag_args);
				break;

			case 'if':
				return this._compile_if_tag(tag_args);
				break;

			case 'else':
				return this._compile_else_tag();
				break;

			case 'elseif':
				return this._compile_elseif_tag(tag_args);
				break;

			case '/if':
				return this._compile_endif_tag();
				break;

			case 'foreach':
				return this._compile_foreach_start(tag_args);
				break;

			case '/foreach':
				return this._compile_foreach_end();
				break;
				
			case '_preCompiler':
				return this._compile_preCompiler(tag_args);
				break;
				
			default:
				return;//tag_args;
				break;

		}
	},
	
	/**
	 * parse usually variables
	 */
	_parse_vars: function(variab, inde) {
		if(inde == undefined) {
			var inde = true;
		}
		var new_var='', list='', var_tmp='';
		
		if(variab instanceof Array) {
			this._syntax_error("error variable");
		}	
	
		if(this._foreach_master['if'] == true && inde) {
			var_tmp = variab.split('.');
			
			
			for(var i=1;i < var_tmp.length; i++) {
				new_var += "['" + var_tmp[i] + "']";
			}
			
			if(this._foreach_master['variables_vars'][var_tmp[0]] != undefined) {
				return var_tmp[0]+new_var;
			}
			
			if(var_tmp[0][0] == '$') {
				var_tmp[0] = var_tmp[0].substr(1);
			}
			
			return "__this.assignes['"+var_tmp[0]+"']";
		}
		else {
			if(variab[0] == '$') {
				var_tmp = (variab.substr(1)).split('.');
	
				if(this._foreach_master['if'] == true && var_tmp.length > 1) {
					for(var i=1; i < var_tmp.length; i++) {
						if(var_tmp[i][0] == '$') {
							list += "["+this._parse_vars(var_tmp[i], inde)+"]";
						}
						else {
							list += "['"+var_tmp[i]+"']";
						}
					}
				}
				else {
					for(var i=0; i < var_tmp.length; i++) {
						if(var_tmp[i][0] == '$') {
							list += "["+this._parse_vars(var_tmp[i], inde)+"]";
						}
						else {
							list += "['"+var_tmp[i]+"']";
						}
					}					
				}
				
				return "__this.assignes"+list;
			}
			else {
				return variab;
			}
		}	
	},
		
	/**
	 * 
	 */
	_compile_include_tag: function(tag_args) {
	
		var attrs = this._parse_attrs(tag_args);
		
		//

		if (attrs['file'] == undefined) {
			this._syntax_error("missing 'file' attribute in include tag");
		}

		for (var arg_name in attrs) {
			var arg_value = attrs[arg_name];
		
			if (arg_name == 'file') {
				var include_file = arg_value;
				continue;
			} else if (arg_name == 'assign') {
				var assign_var = arg_value;
				continue;
			}
			if (typeof arg_value == 'boolean')
				arg_value = arg_value ? 'true' : 'false';
		}

		return  "content += __this._openIncFile('"+include_file+"');\n";
	},
	
	/**
	 *
	 */
	_compile_if_tag: function ($tag_args, $elseif) {
		if($elseif == undefined) {
			$elseif = false;
		}
		
		var regular = this._match_if_tag;
				
		var tokens = $tag_args.match(regular);

		if(tokens == null) {
			var $_error_msg = $elseif ? "'elseif'" : "'if'";
			$_error_msg += ' statement requires arguments'; 
			this._syntax_error($_error_msg);
		}
		
		/* Tokenize args for 'if' tag. */
		var token_count = {};
		
		for(var i=0;i< tokens.length;i++) {
			var key = tokens[i];
			token_count[key] = (token_count[key])? token_count[key] + 1 : 1 ;
		}

		if(token_count['('] != undefined && token_count['('] != token_count[')']) {
			this._syntax_error("unbalanced parenthesis in if statement");
		}

		var is_arg_stack = [];

		for (var i = 0; i < tokens.length; i++) {
		
			switch (tokens[i].toLowerCase()) {
				case '!':
				case '!==':
				case '==':
				case '===':
				case '>':
				case '<':
				case '!=':
				case '<>':
				case '<<':
				case '>>':
				case '<=':
				case '>=':
				case '&&':
				case '||':
				case '|':
				case '^':
				case '&':
				case '~':
				case ')':
				case ',':
				case '%':
				case '+':
				case '-':
				case '*':
				case '/':
				case '@':
					break;

				case 'eq':
					tokens[i] = '==';
					break;

				case 'ne':
				case 'neq':
					tokens[i] = '!=';
					break;

				case 'lt':
					tokens[i] = '<';
					break;

				case 'le':
				case 'lte':
					tokens[i] = '<=';
					break;

				case 'gt':
					tokens[i] = '>';
					break;

				case 'ge':
				case 'gte':
					tokens[i] = '>=';
					break;

				case 'and':
					tokens[i] = '&&';
					break;

				case 'or':
					tokens[i] = '||';
					break;

				case 'not':
					tokens[i] = '!';
					break;

				case 'mod':
					tokens[i] = '%';
					break;

				case '(':
					is_arg_stack.push(i);
					break;

				default: 
					tokens[i] = this._parse_vars(tokens[i]);
					break;
			}
		}

		if ($elseif)
			return "}\nelse if ("+tokens.join(' ')+") {";
		else
			return "if ("+tokens.join(' ')+") {\n"; 
	},
	
	/**
	 *
	 */
	_compile_else_tag: function() {
		return "} \nelse {";
	},
	
	/**
	 *
	 */
	_compile_elseif_tag: function(tag_args) {
		return this._compile_if_tag (tag_args, true);
	},
	
	/**
	 *
	 */
	_compile_endif_tag: function() {
		delete this._foreach_master['variables'][this._foreach_master['counter']]
		return "}\n";
	},
	
	/**
	 *
	 */
	_compile_foreach_start: function(tag_args) {
		this._foreach_master['if'] = true;
		this._foreach_master['counter']++;
		
		
		var attrs = this._parse_attrs(tag_args),
			arg_list = [];
		

		if (attrs['from'] == undefined) {
			return this._syntax_error("foreach: missing 'from' attribute");
		}
		var from = attrs['from'];

		if (attrs['item'] == undefined) {
			return this._syntax_error("foreach: missing 'item' attribute");
		}
		
		var item = this._dequote(attrs['item']);
		
		if (!item.match(this._string_rgexp)) {
			return this._syntax_error("foreach: 'item' must be a variable name (literal string)");
		}
		

		if (attrs['key'] != undefined) {
			var key = this._dequote(attrs['key']);
			
			if (!key.match(this._string_rgexp)) {
				return this._syntax_error("foreach: 'key' must to be a variable name (literal string)");
			}
			var key_part = ", $"+key;
			
			this._foreach_master['variables_vars']["$"+key] = true;
			
		} else {
			var key = null;
			var key_part = '';
		}

		if (attrs['name'] != undefined) {
			var name = attrs['name'];
		} else {
			var name = null;
		}
		

		var output = '';
		
		//
		var from_tmp = from.split('.');

		//
		if(this._foreach_master['if'] == true && this._foreach_master['counter'] != '1') { 
			//
			this._foreach_master['variables_vars']["$"+item] = true;
			
			//
			this._foreach_master['variables'][this._foreach_master['counter']] = "$"+item;
			//
			var var_name = this._parse_vars(from, false).replace(this._replace_assignes, this._foreach_master['variables'][(this._foreach_master['counter']-1)]);
			//
			output += var_name+".forEach(function($"+item+key_part+") { \n";
		}
		else {
			this._foreach_master['variables_vars']['$'+from] = true;
			this._foreach_master['variables_vars']['$'+item] = true;
			//
			this._foreach_master['variables'][this._foreach_master['counter']] = "$"+item;
			// 
			output += this._parse_vars(from, false)+".forEach(function($"+item+key_part+") { \n";
		}
		

		return output;	
	},
	
	/**
	 *
	 */
	_compile_foreach_end: function() {
		this._foreach_master['counter'] = this._foreach_master['counter']-1;
		//

		if(this._foreach_master['counter'] == 0) {
			this._foreach_master['if'] = false;
		}

		return "});\n";	
	},

	/**
	 * pre compile tags (comments, literals, javascripts)
	 */
	_compile_preCompiler: function(tag_args) {
		var attrs = this._parse_attrs(tag_args);
		//tag_args
		console.log();
		//
		switch (attrs['type'].toLowerCase()) {
			case 'comment':
				return '';
				break;
			case 'javascript':
				return this._preCompiler[attrs['id']];
			case 'literal':
				return 'content += "'+this._preCompiler[attrs['id']].replace(this._line_regexp," \\n").replace(this._replace_shashes_regexp, '\\$1')+'";';
				
			default: 
				return '';
		}
	},
	
	/**
	 * parse attr tag
	 */
	_parse_attrs: function(tag_args) {
		/* Tokenize tag attributes. */
		var attrs = {};
		var new_match = {};
		
		/* create key=value array */
		tag_args = tag_args.match(this.attrs_pre_regexp);

		/* parse key=value array, don't work :) */
		for(var i=0; i < tag_args.length; i++) {
			tag_args[i] = tag_args[i].match(this.attrs_regexp);
			
			new_match[tag_args[i][1]] = tag_args[i][2]==undefined?tag_args[i][3]:tag_args[i][2];
		}
		
		//
		for (var token in new_match) {
			last_token = token;
			token = new_match[token];

			/* We booleanize the token if it's a non-quoted possible boolean value. */
			if (token.match(/^(on|yes|true)$/i)) {
				token = 'true';
			} 
			else if (token.match(/^(off|no|false)$/i)) {
				token = 'false';
			} 
			else if (token == 'null') {
				token = 'null';
			}

			attrs[last_token] = token;
			state = 0;
		}
		
		return attrs;	
	},
	
	/**
	 * remove starting and ending quotes from the string
	 */
	_dequote: function (string)  {
		if ((string.substr(0, 1) == "'" || string.substr(0, 1) == '"') && string.substr(-1) == string.substr(0, 1))
			return string.substr(1, -1);
		else
			return string;
	},
	
	/**
	 * console log
	 */
	_syntax_error: function(err) {
		throw err;
		return false;
	},
	
	/**
	 * delete literal && php tags
	 */
	_replacePreProcess: function (source) {
		var match_pre = source.match(this._searchLiteral_pre);
		
		if(match_pre == null) return source;
		
		for(var i=0; i < match_pre.length; i++) {
			var match_work = match_pre[i].match(this._searchLiteral);
			
			if(match_work[2] == undefined) {
				this._preCompiler[i] = match_work[1];
				source = source.split(match_work[0]).join(this.ldq+"_preCompiler id='"+i+"' type='comment'"+this.rdq);
			}
			else {
				this._preCompiler[i] = match_work[2];
				source = source.split(match_work[0]).join(this.ldq+"_preCompiler id='"+i+"' type='"+match_work[1]+"'"+this.rdq);
			}
			
		}
		
		return source;
	},
	
	/**
	 * generate template compilator
	 */
	_fetchPost: function(source_content) {
		source_content = this._replacePreProcess(source_content); 
		
		var template_tags = source_content.match(this._template_tags_regexp);
		var text_blocks = source_content.split(this._text_blocks_regexp);
		
		var compiled_tags = [];
		
		if(template_tags == null) return 'var content = ""; content += "'+source_content.replace(this._line_regexp," \\n").replace(this._replace_shashes_regexp, '\\$1')+'";';

		for (var i = 0; i < template_tags.length; i++) {
			compiled_tags.push(this._parseTags(template_tags[i]));
		}
		
		var compiled_content = '';
		
		for (i = 0; i < compiled_tags.length; i++) {
			if (compiled_tags[i] == undefined) {
				text_blocks[i+1] = text_blocks[i+1].replace(/^(\r\n|\r|\n)/, '');
			}
			
			
			if(text_blocks[i] == undefined || text_blocks[i] == 'undefined') {
				text_blocks[i] = '';
			}
			if(compiled_tags[i] == undefined || compiled_tags[i] == 'undefined') {
				compiled_tags[i] = '';
			}
			
			text_blocks[i] = text_blocks[i].replace(this._line_regexp," \\n");
			
			if(text_blocks[i].replace(this._replace_shashes_regexp, '\\$1') != '') {
				text_blocks[i] = "\ncontent += \""+text_blocks[i].replace(this._replace_shashes_regexp, '\\$1')+"\";\n"; // править
			}
			
			compiled_content += text_blocks[i] + compiled_tags[i];
		}
		//
		if(text_blocks[i] != undefined) {
			compiled_content += "\ncontent += \""+text_blocks[i].replace(this._line_regexp," \\n").replace(this._replace_shashes_regexp, '\\$1')+"\";\n";
		}
		
		return !compiled_content ? null : compiled_content;
	},	
	
	/**
	 * open && compile inc file
	 */
	_openIncFile: function(file) {
		return this.fetchSync(file);
	},
	
	/**
	 * open && read file
	 */
	fetch: function(file, callback) {
		/**
		 * check dirs
		 */
		if(!this._CacheDir) {
			return this._syntax_error('fetch: compile dir not set');
		}
		if(!this._CompileDir) {
			return this._syntax_error('fetch: compile dir not set');
		}
		if(!this._TemplateDir) {
			return this._syntax_error('fetch: template dir not set');
		}
		
		/**
		 * search template file && compile him
		 */
		var _this = this;
		
		//
		this._fs.readFile(this._TemplateDir+file, 'utf8', function (err,data) {
			if (err) {
				return this._syntax_error('err'+err);
			}
			
			callback.call(eval(_this._fetchPost(data)));
		});
	},	
	
	/**
	 * open && read file syncronic
	 */
	fetchSync: function(file, callback) {
		/**
		 * check dirs
		 */
		if(!this._CacheDir) {
			return this._syntax_error('fetchSync: compile dir not set');
		}
		if(!this._CompileDir) {
			return this._syntax_error('fetchSync: compile dir not set');
		}
		if(!this._TemplateDir) {
			return this._syntax_error('fetchSync: template dir not set');
		}
		
		/**
		 * variable global this!
		 */
		var updFile = false,
			fetch,
			data;
		
		/**
		 * search compile file && check is
		 */
		try { 
			var templateSave = this._fs.statSync(this._TemplateDir+file);
			var compileSave = this._fs.statSync(this._CompileDir+file.replace(this._slash_regexp, this._slash_replace)+".js");
			
			if((new Date(templateSave['mtime'])).getTime()/1000.0 < (new Date(compileSave['mtime'])).getTime()/1000.0) {
				fetch = this._fs.readFileSync(this._CompileDir+file.replace(this._slash_regexp, this._slash_replace)+'.js', 'utf8');
			}
			else {
				updFile = true;
			}
			
		} catch (er) { 
			updFile = true;
		} 
		
		if(updFile) {
			data = this._fs.readFileSync(this._TemplateDir+file, 'utf8');
			fetch = this._fetchPost(data);
			this._fs.writeFileSync(this._CompileDir+file.replace(this._slash_regexp, this._slash_replace)+'.js', fetch, 'utf8');
		}
	
		//
		return new Function("var __this = this, content = ''; "+fetch+"; return content;").call(this); //=> return variable "content";
	}
} 