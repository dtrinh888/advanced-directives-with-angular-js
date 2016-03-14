// this is a way to pre populate or insert into the template cache
angular.module('app', []).run(function($templateRequest){
	$templateRequest('/templates/editor.html');
});