/*
  <grid-screen resource="/api/data.json">
    <grid-columns>
      <grid-column title="Product"     field="product"></grid-column>
      <grid-column title="Description" field="description"></grid-column>
      <grid-column title="Cost"        field="cost"></grid-column>
    </grid-columns>
    <grid with-inline-editor></grid>
  </grid-screen>
*/

// 3 domain objects: editor, edit, columns, row

angular.module('app').directive('gridScreen', function($http){
  return {
    restrict: 'E',
    controller: function($scope){
      // where we manage the columns, editior 
      this.setEditor = function(editor){
        // when we call setEditor(), we want to put it in a column
        // to create a triangle widget so the table row can drop down
        $scope.cols.unshift(editor);
      };
      this.setColumns = function(cols){
        $scope.cols = cols;
      };
    },
    link: function(scope, element, attributes){
      $http.get(attributes.resource).success(function(response){
        scope.rows = response.data;
        scope.$broadcast('ready-to-render', scope.rows, scope.cols);
      });
    }
  };
});
angular.module('app').directive('gridColumns', function(){
  return {
    restrict: 'E',
    // we require gridScreen because we need to use
    // setColumns() from gridScreen directive
    // and since it is up a stack we need to use the ^
    // we are not really requiring the gridScreen directive
    // we need the controller in the directive so that we
    // can use the setColumns() 
    require: ['^gridScreen', 'gridColumns'],
    controller: function(){
      var columns = [];
      this.addColumn = function(col){
        columns.push(col);
      };
      this.getColumns = function(){
        return columns;
      };
    },
    link: function(scope, element, attributes, controllers){
      var gridScreenCtrl = controllers[0];
      var gridColumnsCtrl = controllers[1];
      //pushing list of columns
      gridScreenCtrl.setColumns(gridColumnsCtrl.getColumns());
      console.log('linked gridColumns');
    }
  };
});
angular.module('app').directive('gridColumn', function(){
  return {
    restrict: 'E',
    require: '^gridColumns',
    link: function(scope, element, attributes, gridColumnsCtrl){
      gridColumnsCtrl.addColumn({
        // translating html custom elements into data for 
        // domain objects
        title: attributes.title,
        field: attributes.field
      });
      console.log('linked gridColumn', attributes.title);
    }
  };
});
angular.module('app').directive('grid', function(){
  return {
    restrict: 'E',
    templateUrl: '/templates/as_table.html',
    replace: true,
    controller: function($scope){
      $scope.$on('ready-to-render', function(e, rows, cols){
        $scope.rows = rows;
        $scope.cols = cols;
        console.log(rows, cols);
      });
    }
  };
});
angular.module('app').directive('withInlineEditor', function(){
  return {
    restrict: 'A',
    require: '^gridScreen',
    link: function(scope, attributes, element, gridScreenCtrl){
      gridScreenCtrl.setEditor({
        title: 'Edit',
        field: ''
      });
      console.log('linked withInlineEditor');
    }
  };
});
angular.module('app').directive('editorInitializer', function($compile, $templateCache){
  return {
    restrict: 'E',
    templateUrl: '/templates/editor_initializer.html',
    controller: function($scope){
      $scope.edit = function(row){
        // $broadcast for any interested party to say who's
        // responsible for editing this row
        $scope.$broadcast('edit', row);
      };
    },
    // when we have directives that handle DOM event handlers
    // this is where it happens
    link: function(scope, element, attributes){
      // link function will listen into the $broadcast
      scope.$on('edit', function(e, row){
        var editor = $compile($templateCache.get("/templates/editor.html"))(scope);
        $(editor).insertAfter(element.parents("tr"));
      });
      console.log('link editorInitializer');
    }
  };
});