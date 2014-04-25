# 命令

- grunt gen   //编译脚本，将coffee编译成js

- grunt test  //执行单元测试，并生成代码覆盖率报告

- grunt  //编译脚本并测试

# 背景

在web开发过程中，网页中如何引入静态文件成为一个需要解决的问题，传统的直接写标签引入的方式已经不再适用，如何更好的管理静态文件的引入已成为首要的解决问题


# 需求

- 页面中各模块根据自己的需要引入静态文件

- 各模块中重复引入的静态文件应该可以去重

- 可以为静态文件配置对应的版本号（为了能够避免浏览器缓存问题导致的更新不及时）

- 可以根据配置的合并文件将引入的相应静态文件合并，只引入合并后的文件

- 可以配置多个host，静态文件随机选择不同的host加载


# API

- [constructor](#constructor)

- [hosts](#hosts)

- [version](#version)

- [getFiles](#getFiles)

- [importCss](#importCss)

- [importJs](#importJs)

- [importFile](#importFile)

- [exportCss](#exportCss)

- [exportJs](#exportJs)

- [exportFile](#exportFile)

- [debug](#debug)



<a name="constructor" />
## constructor
### 构造函数，返回FileImporter对象

#### 参数列表

- merger [Merger] 合并文件的处理实现（可选），若有设置该参数且debug不为true，则根据该对象做合并静态文件处理，

```js
var FileImporter = require('jtfileimporter');
var importer = new FileImporter();
```


<a name="hosts" />
## hosts
### 获取（以数组的形式返回）或设置hosts

#### 参数列表

- hosts [String, Array] 需要设置的hosts。若无参数则表示获取


```js
//设置单个host
importer.hosts('vicanso.com');
//设置多个host
importer.hosts(['vicanso.com', 'vxs.me']);
//返回当前设置的hosts
var hosts = importer.hosts();
```



<a name="version" />
## version
### 设置静态文件的版本号

### 参数列表

- versionConfig [String, Object] 版本号参数，若为字符串，所有的引入文件使用相同的版本号，也可以配置各个文件使用不同的版本号

```js
importer.version('0001');
var versionConfig = {
    "/stylesheets/mobile.css": 613300289,
    "/stylesheets/mobile_ui.css": 174195748,
    "/stylesheets/novel.css": 177648453,
    "/stylesheets/novel_list.css": 996742404,
    "/stylesheets/page_btns.css": 4267328749,
    "/stylesheets/search.css": 206866369,
    "/stylesheets/ui.css": 1229334236
};
importer.version(versionConfig);
```


<a name="getFiles" />
## getFiles
### 获取当前已引入的静态文件

#### 参数列表

- type [String] 需要返回的文件类型，可选为：js, css

```js
//返回js文件
var jsFiles = importer.getFiles('js');
//返回css文件
var cssFiles = importer.getFiles('css');
```


<a name="importCss" />
## importCss
### 引入css文件

#### 参数列表

- files [String, Array] 引入文件路径


```js
//引入单个css文件
importer.importerCss('/stylesheets/css.css');
//引入多个css文件
importer.importerCss(['/stylesheets/css.css', '/stylesheets/tmp.css']);
```


<a name="importJs" />
## importJs
### 引入js文件

#### 参数列表

- files [String, Array] 引入文件路径


```js
//引入单个js文件
importer.importerJs('/javascripts/js.js');
//引入多个js文件
importer.importerJs(['/javascripts/js.js', '/javascripts/tmp.js']);
```


<a name="importFile" />
## importFile
### 引入静态文件

#### 参数列表

- files [String, Array] 引入文件路径
- type [String] 引入文件类型，可选为：js, css

```js
//引入js
importer.importFile('/javascripts/js.js', 'js');
importer.importFile(['/javascripts/js.js', '/javascripts/tmp.js'], 'js');
//引入css
importer.importFile('/stylesheets/css.css', 'css');
importer.importFile(['/stylesheets/css.css', '/stylesheets/tmp.css'], 'css');
```


< a name="exportCss" />
## exportCss
### 输出css标签

```js
var cssLinks = importer.exportCss();
```


< a name="exportJs" />
## exportJs
### 输出js标签


```js
var scripts = importer.exportJs();
```


< a name="exportFile" />
## exportFile
### 输出静态文件标签

#### 参数列表

- type [String] 静态文件类型

```js
var scripts = importer.exportFile('js');
```


<a name="debug" />
## debug
### 设置是否为debug模式，在页面中使用非压缩，非合并文件（只对于js文件）

### 参数列表

- debug [Boolean] 是否debug

```js
importer.debug(true);
```
