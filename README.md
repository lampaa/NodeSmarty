<pre>
var NodeSmarty = require('../controllers/NodeSmarty');

var Template = new NodeSmarty();

Template
   .setTemplateDir('./views/templates/')
   .setCompileDir('./views/compile/')
   .setCacheDir('./views/cache/'); 
</pre>

<h1>Quick start</h1>
Легкое подключение и запуск библиотеки. Минимальное количество настроек, а также удобное представление функций позволяет вам наслаждаться программированием вместе с шаблонизатором <b>NodeSmarty</b>. 


<hr>


<pre>
 var Array = ['One', 'Two', 'Free'];

Template.assign({
   'Value':'first',
   'Value2':'second',
   'Value3':'third',
   'Array':Array
}); 
</pre>


<pre>
Value: {$Value};
Value2: {$Value2};
{if $Value3} Value3: {$Value3} {/if}.

Array:
{foreach from=$Array item=Foo}
   {$Foo}
{/foreach} 
</pre>

<h1>Easy use</h1>
Добавляйте свои переменные в код объекта <b>NodeSmarty</b> с помощью функции <i>assign</i>. Потом объявите переменные в шаблоне вашего проекта с помощью фигурных скобок (кстати их можно переопределить) и запускайте свой сайт! 


<hr>

<h1>Fast processing</h1>
Все шаблоны при использовании проходят дополнительную обработку - компиляцию. Шаблон компилируется в чистый (<i>native</i>) <i>JavaScript</i> код, причем как компиляция, так и исполнение кода являются самыми быстрыми при сравнении с остальными шаблонизаторами!