
# JTFileImporter

[![Build Status](https://travis-ci.org/vicanso/jtfileimporter.svg)](https://api.travis-ci.org/vicanso/jtfileimporter.png)

# 背景

在web开发过程中，网页中如何引入静态文件成为一个需要解决的问题，传统的直接写标签引入的方式已经不再适用，如何更好的管理静态文件的引入已成为首要的解决问题


# 需求

- 页面中各模块根据自己的需要引入静态文件

- 各模块中重复引入的静态文件应该可以去重

- 可以为静态文件配置对应的版本号（为了能够避免浏览器缓存问题导致的更新不及时）

- 可以为静态文件添加特定的前缀url(为了在同样的host下部署不同的应用，以前缀区分)

- 可以配置多个host，静态文件随机选择不同的host加载


# API

- [constructor](#constructor)

- [prefix](#prefix)

- [hosts](#hosts)

- [version](#version)

- [versionMode](#versionMode)

- [import](#import)

- [exportCss](#exportCss)


<a name="constructor" />
## constructor
### 构造函数，返回Importer对象

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
```


<a name="prefix" />
## prefix
### 静态文件url前缀

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
//set
import.prefix = '/mobile';
//get
console.dir(importer.prefix);
```


<a name="hosts" />
## hosts
### 静态文件使用的hosts（可以是字符串或者数组）

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
// 设置为单个域名
importer.hosts = 'vicanso.com';
// 设置为多个域名
importer.hosts = ['vicanso.com', 'jenny.com'];
```


<a name="version" />
## version
### 静态文件的版本号（可以是字符串或者对象）

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
// 设置单个版本号（所有静态文件共用）
importer.version = 'abcd';
// 设置为Object
importer.version = {
	'/a.js' : 'abce',
	'/b.js' : 'defac',
	'/c.css' : 'ogjeaofe',
	'default' : 'bdae'  //未在对象中配置的静态文件使用
};
```

<a name="versionMode" />
## versionMode
### 引入版本号的形式（0：fileName.ext?v=xxx的形式，1:fileName_xxx.ext）

```js
var importer = new Importer();
importer.import('/abc/1.css', '/2.css');
importer.versionMode = 1;
importer.version = {
  '/abc/1.css' : '123',
  '/2.css' : '234'
};
importer.exportCss(); // <link rel="stylesheet" href="/abc/1.123.css" type="text/css" /><link rel="stylesheet" href="/2.234.css" type="text/css" />
```


<a name="import" />
## import
### 引入静态文件

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
importer.import('/a.js');
importer.import('/b.js', '/c.css');
importer.import(['/d.js', '/e.css']);
```


<a name="exportCss" />
## exportCss
### 导出css样式

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
importer.import('/a.js');
importer.import('/b.js', '/c.css');
importer.import(['/d.js', '/e.css']);
importer.exportCss();   //<link rel="stylesheet" href="/c.css" type="text/css" /><link rel="stylesheet" href="/e.css" type="text/css" />
```



<a name="exportJs" />
## exportJs
### 导出js样式

```js
var Importer = require('jtfileimporter');
var importer = new Importer();
importer.import('/a.js');
importer.import('/b.js', '/c.css');
importer.import(['/d.js', '/e.css']);
importer.exportJs();   //<script type="text/javascript" src="/a.js"></script><script type="text/javascript" src="/b.js"></script><script type="text/javascript" src="/d.js"></script>
```
